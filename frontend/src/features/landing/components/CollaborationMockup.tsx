/**
 * A purely visual mock editor component showing real-time collaboration.
 * All animations are CSS-driven — zero state, zero interactivity.
 */
export function CollaborationMockup() {
  return (
    <div className="landing-mock-editor">
      {/* Title bar */}
      <div className="landing-mock-titlebar">
        <div className="landing-mock-dot landing-mock-dot-red" />
        <div className="landing-mock-dot landing-mock-dot-yellow" />
        <div className="landing-mock-dot landing-mock-dot-green" />
        <span className="landing-mock-title">Project Roadmap.md</span>
      </div>

      {/* Collaborator avatars */}
      <div className="landing-mock-avatars">
        <div className="landing-mock-avatar">
          <div
            className="landing-mock-avatar-dot"
            style={{ background: "oklch(0.65 0.27 340)" }}
          />
          <span style={{ color: "var(--foreground)" }}>You</span>
        </div>
        <div className="landing-mock-avatar">
          <div
            className="landing-mock-avatar-dot"
            style={{ background: "oklch(0.65 0.2 250)" }}
          />
          <span style={{ color: "var(--muted-foreground)" }}>Sarah K.</span>
        </div>
        <div className="landing-mock-avatar">
          <div
            className="landing-mock-avatar-dot"
            style={{ background: "oklch(0.7 0.19 155)" }}
          />
          <span style={{ color: "var(--muted-foreground)" }}>Mike R.</span>
        </div>
      </div>

      {/* Mock content */}
      <div className="landing-mock-body">
        <div className="landing-mock-line" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
          # Q3 Product Roadmap
        </div>

        <div className="landing-mock-line" style={{ height: "0.8rem" }} />

        <div className="landing-mock-line">
          <span>Launch real-time collaboration by end of sprint</span>
          <span
            className="landing-mock-cursor"
            style={{ background: "oklch(0.65 0.27 340)" }}
          />
          <span
            className="landing-mock-cursor-label"
            style={{ background: "oklch(0.65 0.27 340)" }}
          >
            You
          </span>
        </div>

        <div className="landing-mock-line" style={{ color: "var(--muted-foreground)" }}>
          Integrate offline-first sync with CRDTs
        </div>

        <div className="landing-mock-line" style={{ height: "0.8rem" }} />

        <div className="landing-mock-line" style={{ fontWeight: 600 }}>
          ## Security Milestones
        </div>

        <div className="landing-mock-line">
          <span className="landing-mock-typing">
            End-to-end encryption for shared spaces...
          </span>
          <span
            className="landing-mock-cursor"
            style={{ background: "oklch(0.65 0.2 250)", animationDelay: "0.5s" }}
          />
          <span
            className="landing-mock-cursor-label"
            style={{ background: "oklch(0.65 0.2 250)" }}
          >
            Sarah
          </span>
        </div>

        <div className="landing-mock-line" style={{ color: "var(--muted-foreground)" }}>
          Zero-knowledge proof of ownership
        </div>

        <div className="landing-mock-line">
          <span>Audit trail for compliance</span>
          <span
            className="landing-mock-cursor"
            style={{ background: "oklch(0.7 0.19 155)", animationDelay: "0.3s" }}
          />
          <span
            className="landing-mock-cursor-label"
            style={{ background: "oklch(0.7 0.19 155)" }}
          >
            Mike
          </span>
        </div>
      </div>
    </div>
  );
}
