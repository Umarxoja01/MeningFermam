// Sarlavha so'zma-so'z chiqadi (demo v12). So'zlar serverda bo'linadi; reduced-motion'da darhol ko'rinadi (CSS).
export function H2Words({ text, id, className = "h2" }: { text: string; id?: string; className?: string }) {
  const words = text.split(" ");
  return (
    <h2 className={className} id={id}>
      {words.map((w, i) => (
        <span key={i}>
          <span className="w" style={{ transitionDelay: `${i * 0.05}s` }}>{w}</span>{i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </h2>
  );
}
