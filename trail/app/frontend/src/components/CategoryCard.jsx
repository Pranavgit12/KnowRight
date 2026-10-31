import { ArrowUpRight } from "lucide-react";

export default function CategoryCard({ icon: Icon, title, description, onSelect }) {
  return (
    <button className="category-card" onClick={onSelect} type="button">
      <span className="category-icon"><Icon size={20} strokeWidth={1.7} /></span>
      <span className="category-title">{title}</span>
      <span className="category-description">{description}</span>
      <ArrowUpRight className="category-arrow" size={17} />
    </button>
  );
}
