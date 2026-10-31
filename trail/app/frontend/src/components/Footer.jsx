import { ArrowUpRight, BookOpenText } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div>
          <Link to="/" className="wordmark footer-brand"><span className="wordmark-icon"><BookOpenText size={21} /></span><span>KnowRight<span className="wordmark-dot">.</span></span></Link>
          <p>Legal information, in language that feels human.</p>
        </div>
        <div className="footer-links">
          <Link to="/assistant">Ask a question <ArrowUpRight size={13} /></Link>
          <Link to="/sources">Browse sources</Link>
          <Link to="/help">About &amp; limitations</Link>
        </div>
      </div>
      <div className="footer-bottom"><span>General information only—not legal advice.</span><span>Selected India-wide central-law sources only.</span></div>
    </footer>
  );
}
