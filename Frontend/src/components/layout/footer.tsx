import { Github, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import { UI_FOOTER } from "../styles/ui_footer_style";

export default function Footer() {
  return (
    <footer className={UI_FOOTER.root}>
      <div className={UI_FOOTER.container}>
        <Link to="/" className={UI_FOOTER.titleLink}>
          Ministerio de Relaciones Exteriores Paraguay — Consulado de la Provincia de Formosa
        </Link>

        <p className={UI_FOOTER.copyright}>
          © {new Date().getFullYear()} Riveros Edgardo Nahuel
        </p>

        <div className={UI_FOOTER.socialWrap}>
          <a
            href="https://www.linkedin.com/in/felix-raul-bordon-sbardella-7844a9280/"
            target="_blank"
            rel="noopener noreferrer"
            className={UI_FOOTER.socialLink}
            aria-label="LinkedIn"
          >
            <Linkedin className={UI_FOOTER.socialIcon} />
          </a>

          <a
            href="https://github.com/RaulBordon2020"
            target="_blank"
            rel="noopener noreferrer"
            className={UI_FOOTER.socialLink}
            aria-label="GitHub"
          >
            <Github className={UI_FOOTER.socialIcon} />
          </a>
        </div>
      </div>
    </footer>
  );
}
