import { useState, useRef, useEffect } from "react";



const REAL_API = "https://staking.real.finance/api/trpc";

// Campaign constants
const CAMPAIGN_START = new Date("2026-05-14T10:00:00Z").getTime(); // activation_epoch from API
const CAMPAIGN_END = new Date("2026-08-12T10:00:00Z").getTime();
const POOL_DURATION_SECONDS = 7776000; // 90 days
const REWARD_POOL_USD = 50000;

interface PoolInfo {
  total_staked: string;
  staker_count: number;
  total_rewards_funded_usd: string;
  total_effective_weight: string;
  total_accumulated_weight: string;
  activation_epoch: number;
  end_epoch: number;
  current_penalty_pct: string;
  phase: string;
}

interface PriceInfo {
  avg_price_usd: string;
}

interface WalletInfo {
  wallet: string;
  amount_staked: string;
  accumulated_weight: string;
  share_of_pool_pct: string;
  share_of_weight_pct: string;
  accrued_rewards_usd: string;
  claimed_rewards_usd: string;
  pending_penalty: string;
  pending_penalty_pct: string;
}

function formatNum(n: number, decimals = 2): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return n.toFixed(decimals);
}

function daysLeft(): number {
  const now = Date.now();
  return Math.max(0, Math.ceil((CAMPAIGN_END - now) / 86400000));
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-2">
      <div
        style={{
          width: 22, height: 22,
          borderRadius: "50%",
          border: "2.5px solid rgba(32,80,242,0.2)",
          borderTopColor: "#2050f2",
          animation: "spin 0.7s linear infinite",
        }}
      />
    </div>
  );
}

export default function Index() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [poolLoading, setPoolLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [poolInfo, setPoolInfo] = useState<PoolInfo | null>(null);
  const [priceInfo, setPriceInfo] = useState<PriceInfo | null>(null);
  const [walletData, setWalletData] = useState<WalletInfo | null>(null);
  const [showResult, setShowResult] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // Fetch pool info on mount
  useEffect(() => {
    async function fetchPool() {
      setPoolLoading(true);
      try {
        const res = await client.api["staking"]["info"].$get();
        if (res.ok) {
          const data = await res.json() as any;
          setPoolInfo(data.info);
          setPriceInfo(data.price);
        }
      } catch {}
      setPoolLoading(false);
    }
    fetchPool();
  }, []);

  async function handleCheck() {
    const addr = address.trim().toLowerCase();
    if (!addr.match(/^0x[a-f0-9]{40}$/)) {
      setError("Enter a valid Ethereum address (0x...)");
      return;
    }
    setLoading(true);
    setError(null);
    setWalletData(null);
    setShowResult(false);

    try {
      const res = await client.api["staking"]["wallet"][":address"].$get({ param: { address: addr } });
      const data = await res.json() as any;
      if (!res.ok || data.error) {
        setError(data.error ?? "Wallet not found or has no stake.");
        setLoading(false);
        return;
      }
      setWalletData(data.wallet);
      setTimeout(() => {
        setShowResult(true);
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
      }, 50);
    } catch {
      setError("Network error. Try again.");
    }
    setLoading(false);
  }

  const totalStaked = poolInfo ? parseFloat(poolInfo.total_staked) : 0;
  const effectiveWeight = poolInfo ? parseFloat(poolInfo.total_effective_weight) : 0;
  const price = priceInfo ? parseFloat(priceInfo.avg_price_usd) : 0;
  const days = daysLeft();

  // Wallet computed values
  const walletStaked = walletData ? parseFloat(walletData.amount_staked) : 0;
  const walletWeight = walletData ? parseFloat(walletData.accumulated_weight) : 0;
  const shareOfWeight = walletData ? parseFloat(walletData.share_of_weight_pct) : 0;
  const projectedUsdc = effectiveWeight > 0 ? (walletWeight / effectiveWeight) * REWARD_POOL_USD : 0;
  const accruedUsdc = walletData ? parseFloat(walletData.accrued_rewards_usd) : 0;
  const penaltyPct = walletData ? parseFloat(walletData.pending_penalty_pct) : 0;
  const penaltyAmount = walletData ? parseFloat(walletData.pending_penalty) : 0;
  const stakeValueUsd = walletStaked * price;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #0a0c15 0%, #0b0d16 50%, #0a0b14 100%)",
        color: "#fff",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.35s ease forwards; }
        * { box-sizing: border-box; }
        ::placeholder { color: rgba(255,255,255,0.25); }
        input:focus { outline: none; }
      `}</style>

      {/* Header */}
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "20px 24px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          {/* Real Genesis logo */}
          <img
            src="/apple-touch-icon.png"
            alt="Real Genesis"
            style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }}
          />
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.9)" }}>
            REAL GENESIS
          </span>
          <span style={{ color: "rgba(255,255,255,0.2)", margin: "0 4px" }}>·</span>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Staking Calculator
          </span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 7, height: 7, borderRadius: "50%", background: "#30e000",
              boxShadow: "0 0 8px #30e000",
            }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Live
            </span>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "48px clamp(16px, 4vw, 24px) 80px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(32,80,242,0.08)", border: "1px solid rgba(32,80,242,0.2)",
            borderRadius: 100, padding: "6px 14px", marginBottom: 20,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#2050f2", boxShadow: "0 0 8px rgba(32,80,242,0.8)" }} />
            <span style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "#2050f2", fontWeight: 600 }}>
              Pre-Launch Staking · Live Now
            </span>
          </div>
          <h1 style={{
            fontSize: "clamp(28px, 5vw, 46px)", fontWeight: 700,
            letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 16,
          }}>
            How much USDC will<br />
            <span style={{ color: "#2050f2" }}>your stake</span> earn?
          </h1>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 15, lineHeight: 1.7, maxWidth: 480, margin: "0 auto" }}>
            Enter your Ethereum wallet address to see your exact time-weighted share of the $50,000 USDC Genesis Campaign pool.
          </p>
        </div>

        {/* Pool Stats Bar */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14, padding: "20px 28px",
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: 0, marginBottom: 32,
        }}>
          {[
            { label: "Total Staked", value: poolLoading ? "—" : formatNum(totalStaked, 0) + " $ASSET", sub: poolLoading ? "" : `≈ $${formatNum(totalStaked * price)}` },
            { label: "Stakers", value: poolLoading ? "—" : poolInfo?.staker_count.toString() ?? "—", sub: "wallets active" },
            { label: "Reward Pool", value: "$50,000", sub: "USDC fixed" },
            { label: "$ASSET Price", value: poolLoading ? "—" : `$${parseFloat(priceInfo?.avg_price_usd ?? "0").toFixed(4)}`, sub: "avg across exchanges" },
            { label: "Days Left", value: days.toString(), sub: "ends Aug 12, 2026" },
          ].map((stat, i, arr) => (
            <div key={stat.label} style={{
              textAlign: "center", padding: "8px 16px",
              borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none",
            }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 6 }}>
                {stat.label}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums" }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>
                {stat.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Input Card */}
        <div style={{
          background: "#111420",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 18, padding: "clamp(20px, 5vw, 36px)",
          marginBottom: 28,
        }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
            Your Wallet Address
          </div>
          <div style={{ display: "flex", gap: 12, flexDirection: "column" }}>
            <input
              type="text"
              placeholder="0x..."
              value={address}
              onChange={(e) => { setAddress(e.target.value); setError(null); }}
              onKeyDown={(e) => e.key === "Enter" && handleCheck()}
              style={{
                flex: 1, minWidth: 0, width: "100%",
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${error ? "rgba(242,64,80,0.5)" : address.length > 0 ? "rgba(32,80,242,0.5)" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 8, padding: "14px 18px",
                color: "#fff", fontSize: 15,
                fontFamily: '"SF Mono", "Fira Code", monospace',
                letterSpacing: "0.02em",
                transition: "border-color 0.2s",
              }}
            />
            <button
              onClick={handleCheck}
              disabled={loading || !address}
              style={{
                background: loading ? "rgba(32,80,242,0.4)" : "#2050f2",
                border: "none", borderRadius: 8,
                padding: "14px 28px", color: "#fff",
                fontSize: 13, fontWeight: 600,
                letterSpacing: "0.05em", textTransform: "uppercase",
                cursor: loading || !address ? "not-allowed" : "pointer",
                minWidth: 0, width: "100%",
                transition: "background 0.2s",
              }}
            >
              {loading ? <Spinner /> : "Check Rewards"}
            </button>
          </div>

          {error && (
            <div style={{
              marginTop: 12, padding: "10px 14px",
              background: "rgba(242,64,80,0.08)", border: "1px solid rgba(242,64,80,0.2)",
              borderRadius: 8, fontSize: 13, color: "#f24050",
            }}>
              {error === "Wallet not found or has no stake." 
                ? "This wallet has no active stake in the Genesis Campaign. Stake at staking.real.finance to participate."
                : error}
            </div>
          )}

          <p style={{ marginTop: 14, fontSize: 12, color: "rgba(255,255,255,0.2)", lineHeight: 1.6 }}>
            Data refreshes every 12 hours. Your wallet must have an active stake on Ethereum to appear.
          </p>
        </div>

        {/* Results */}
        {walletData && (
          <div
            ref={resultRef}
            className={showResult ? "fade-up" : ""}
            style={{ opacity: showResult ? 1 : 0 }}
          >
            {/* Main Result */}
            <div style={{
              background: "#111420",
              border: "1px solid rgba(32,80,242,0.25)",
              borderRadius: 18, padding: "36px",
              marginBottom: 16,
              boxShadow: "0 0 40px rgba(32,80,242,0.08)",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
                <div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
                    Estimated USDC Reward at Close
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                    <span style={{ fontSize: "clamp(36px, 6vw, 56px)", fontWeight: 800, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
                      ${projectedUsdc.toFixed(2)}
                    </span>
                    <span style={{ fontSize: 18, color: "#2050f2", fontWeight: 700, letterSpacing: "0.04em" }}>USDC</span>
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>
                    {shareOfWeight.toFixed(6)}% of total pool weight · paid Aug 12, 2026
                  </div>
                </div>
                <div style={{
                  background: "rgba(32,80,242,0.08)", border: "1px solid rgba(32,80,242,0.15)",
                  borderRadius: 12, padding: "18px 24px", textAlign: "center", minWidth: 160,
                }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 6 }}>Accrued So Far</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#2050f2", fontVariantNumeric: "tabular-nums" }}>
                    ${accruedUsdc.toFixed(4)}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 3 }}>USDC earned to date</div>
                </div>
              </div>

              {/* Divider */}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", margin: "28px 0" }} />

              {/* Position Details */}
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 0,
              }}>
                {[
                  { label: "Your Stake", value: formatNum(walletStaked, 2) + " $ASSET" },
                  { label: "Stake Value", value: `$${formatNum(stakeValueUsd, 2)}` },
                  { label: "Pool Share", value: parseFloat(walletData.share_of_pool_pct).toFixed(4) + "%" },
                  { label: "Weight Share", value: shareOfWeight.toFixed(6) + "%" },
                ].map((item, i, arr) => (
                  <div key={item.label} style={{
                    padding: "0 20px", textAlign: "center",
                    borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none",
                  }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 6 }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Early Exit Warning */}
            {penaltyPct > 0 && (
              <div style={{
                background: "rgba(255,214,65,0.06)", border: "1px solid rgba(255,214,65,0.2)",
                borderRadius: 12, padding: "16px 20px",
                display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16,
              }}>
                <span style={{ fontSize: 16, marginTop: 1 }}>⚠️</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#ffd641", marginBottom: 4 }}>
                    Early Exit Penalty: {penaltyPct.toFixed(2)}%
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
                    If you unstake now, you forfeit {formatNum(penaltyAmount, 2)} $ASSET ({penaltyPct.toFixed(2)}% of your position).
                    The penalty decreases linearly as the campaign progresses. Hold until Aug 12 to claim your full USDC reward with no penalty.
                  </div>
                </div>
              </div>
            )}

            {/* How it's calculated */}
            <div style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12, padding: "20px 24px",
            }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 14 }}>
                How this is calculated
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.9 }}>
                <strong style={{ color: "rgba(255,255,255,0.7)" }}>Weight</strong> = Tokens staked × Days remaining when you staked
                <br />
                <strong style={{ color: "rgba(255,255,255,0.7)" }}>Your share</strong> = Your weight ÷ Total pool weight
                <br />
                <strong style={{ color: "rgba(255,255,255,0.7)" }}>Estimated USDC</strong> = Your share × $50,000 pool
                <br />
                <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>
                  As more participants stake, total pool weight increases and individual shares adjust. This estimate reflects current pool state.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* How it works — always shown */}
        <div style={{ marginTop: 64 }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
              How It Works
            </div>
            <h2 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 700, letterSpacing: "-0.02em" }}>
              Time-Weighted Rewards
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {[
              {
                n: "01", title: "Stake $ASSET",
                body: "Stake any amount before Aug 12, 2026. Earlier entries earn more weight — the longer you're in, the larger your share.",
              },
              {
                n: "02", title: "Weight = Amount × Time",
                body: "Your weight grows every second. Alice stakes 1,000 on Day 1 (90 days) → weight 90,000. Bob stakes 1,000 on Day 46 (45 days) → weight 45,000. Same tokens, half the share.",
              },
              {
                n: "03", title: "Claim USDC at Close",
                body: "On August 12, $50,000 USDC is distributed pro-rata by weight. No price risk on the reward — it's stablecoin regardless of $ASSET price.",
              },
            ].map((step) => (
              <div key={step.n} style={{
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14, padding: "24px 24px 26px",
              }}>
                <div style={{
                  fontSize: 11, color: "#2050f2", letterSpacing: "0.08em",
                  textTransform: "uppercase", fontWeight: 700, marginBottom: 12,
                }}>
                  {step.n}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>{step.title}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>{step.body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{
          marginTop: 56, textAlign: "center",
          padding: "40px 24px",
          background: "rgba(32,80,242,0.05)", border: "1px solid rgba(32,80,242,0.12)",
          borderRadius: 18,
        }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>Not staked yet?</div>
          <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>
            {days} days left to earn from the pool
          </h3>
          <a
            href="https://staking.real.finance"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#2050f2", color: "#fff",
              borderRadius: 8, padding: "14px 28px",
              fontSize: 13, fontWeight: 600,
              letterSpacing: "0.05em", textTransform: "uppercase",
              textDecoration: "none",
              transition: "background 0.2s",
            }}
          >
            Stake at staking.real.finance →
          </a>
          <p style={{ marginTop: 16, fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
            Earlier stakes earn a larger share. The discount window doesn't stay open forever.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.07)",
        padding: "24px",
        textAlign: "center",
        fontSize: 12, color: "rgba(255,255,255,0.2)",
      }}>
        Data sourced from the Real Finance staking protocol · Updates every 12 hours · NFA — DYOR · Made by <a href="https://x.com/0xmaniach" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>0xManiach</a> with ❤️‍🔥
      </footer>
    </div>
  );
}
