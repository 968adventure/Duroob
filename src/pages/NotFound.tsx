/**
 * Bilingual Duroob 404: keeps the field-journal voice and offers a route back.
 */
import { Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="notfound-page is-ar" dir="rtl">
      <div className="notfound-card glass-panel">
        <Compass size={26} aria-hidden="true" />
        <p className="section-kicker">ROUTE / 404</p>
        <h1>هذا المسار غير موجود</h1>
        <p lang="en" dir="ltr">
          This route does not exist. It may have been moved or renamed.
        </p>
        <Link to="/" className="notfound-link">
          <span>العودة إلى دروب</span>
          <span lang="en" dir="ltr">
            Back to Duroob
          </span>
        </Link>
      </div>
    </main>
  );
}
