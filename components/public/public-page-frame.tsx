import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function PublicPageFrame({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <SiteHeader />
      <main id="main-content">{children}</main>
      <SiteFooter />
    </>
  );
}
