import { Link } from "@tanstack/react-router";

import { Logo } from "@/components/brand/Logo";

export function SiteFooter() {
  return (
    <footer className="bg-navy text-navy-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-3">
        <div>
          <Logo dark />
          <p className="mt-3 max-w-xs text-sm text-navy-foreground/60">
            One headline in. A viral post, an SEO article, and an Urdu video out.
          </p>
        </div>
        <div className="space-y-2.5 text-sm text-navy-foreground/70">
          <p className="mb-3 font-display font-semibold text-navy-foreground">Product</p>
          <Link className="block hover:text-teal" to="/packages">
            Packages
          </Link>
          <Link className="block hover:text-teal" to="/contact">
            Contact
          </Link>
        </div>
        <div className="space-y-2.5 text-sm text-navy-foreground/70">
          <p className="mb-3 font-display font-semibold text-navy-foreground">Legal</p>
          <Link className="block hover:text-teal" to="/privacy">
            Privacy policy
          </Link>
          <Link className="block hover:text-teal" to="/terms">
            Terms of service
          </Link>
        </div>
      </div>
      <div className="border-t border-navy-foreground/10 py-4 text-center text-xs text-navy-foreground/50">
        © 2026 Acclaira · acclaira.com
      </div>
    </footer>
  );
}
