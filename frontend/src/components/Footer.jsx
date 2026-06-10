import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <h1 className="footer-title">
          Snapwall where moments live forever
        </h1>
        <p className="footer-subtitle">
            Designed and Developed By{" "}
        <a
            href="https://www.instagram.com/vignesh_makthala"
            target="_blank"
            rel="noopener noreferrer"
            className="insta-link"
            >
            @vignesh_makthala
        </a>
        </p>
      </div>

      <div className="footer-bottom">
        <span>© 2026. All rights reserved</span>
        <div className="footer-links">
          <a href="https://docs.google.com/forms/d/e/1FAIpQLScqXx6YhmnUGhP0CqLhDGGLczezziK2x8QzIYKcFEkz1QuL9A/viewform?usp=publish-editor" target="_blank">Feedback</a>
          <a href="/terms-and-conditions">Terms & Conditions</a>
          <a href="/privacy-policy">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
