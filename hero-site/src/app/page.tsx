import HomeClient from '@/components/HomeClient';

// Visually hidden but present in the server-rendered HTML (accessible to
// crawlers and screen readers). It carries no private birthday content.
const srOnly: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

export default function Page() {
  return (
    <>
      <header style={srOnly}>
        <h1>Happy Birthday Kaawya</h1>
        <p>A special birthday website with heartfelt wishes and a surprise made just for Kaawya.</p>
      </header>
      <HomeClient />
    </>
  );
}

