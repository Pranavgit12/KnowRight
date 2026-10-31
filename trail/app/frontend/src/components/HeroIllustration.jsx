import { BookOpenCheck, Leaf, MapPin, Scale } from "lucide-react";

export default function HeroIllustration() {
  return (
    <div className="hero-art" role="img" aria-label="Illustration of balanced scales, legal references, and a sprig of leaves">
      <div className="art-aura" />
      <div className="art-orbit orbit-a" /><div className="art-orbit orbit-b" />
      <div className="art-plinth plinth-back" /><div className="art-plinth plinth-front" />
      <div className="justice-figure">
        <div className="figure-halo" />
        <div className="figure-head" />
        <div className="figure-hair" />
        <div className="figure-body" />
        <div className="figure-sash" />
        <div className="figure-arm arm-left" /><div className="figure-arm arm-right" />
        <div className="scale-beam" /><div className="scale-stem" /><div className="scale-finial" />
        <div className="scale-string string-left" /><div className="scale-string string-right" />
        <div className="scale-pan pan-left" /><div className="scale-pan pan-right" />
        <div className="figure-pedestal" />
      </div>
      <div className="floating-note note-source"><BookOpenCheck size={17} /><span><b>Source-led</b><small>Check the original</small></span></div>
      <div className="floating-note note-place"><MapPin size={16} /><span><b>Location matters</b><small>India · central law</small></span></div>
      <div className="art-leaf leaf-one"><Leaf size={32} /></div>
      <div className="art-leaf leaf-two"><Leaf size={24} /></div>
      <span className="art-caption">A little more clarity, one step at a time</span>
    </div>
  );
}
