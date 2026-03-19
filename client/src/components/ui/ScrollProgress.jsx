import useUIStore from '../../store/uiStore';

export default function ScrollProgress() {
  const progress = useUIStore((s) => s.scrollProgress);
  return (
    <div
      id="scroll-progress"
      style={{ width: `${progress}%` }}
    />
  );
}
