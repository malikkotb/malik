import { InfiniteScroll } from '@/components/Infinite-Scroll/infinite-scroll';
import { PixelatedImage } from '@/components/PixelatedImage/PixelatedImage';

const images = [
    '/img1.png',
    '/img2.png',
    '/img3.png',
    '/img4.png',
];

// Deterministic random function for padding direction
// Returns: 'left', 'right', or 'center'
const getPaddingDirection = (index) => {
    // Use multiplication with large primes and modulo for even distribution
    const hash = (index * 73856093 + index * 19349663) % 100;
    if (hash < 33) return 'left';
    if (hash < 66) return 'right';
    return 'center';
};

export default function PixelatedInfiniteScroll() {
    return (
        <main
            style={{
                position: 'fixed',
                top: 40,
                left: 0,
                right: 0,
                bottom: 0,
                color: 'white',
            }}
        >
            <InfiniteScroll style={{ height: '100%' }}>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '30vh',
                        paddingBottom: '30vh',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {Array.from({ length: 4 }).map((_, i) => {
                        const paddingDirection = getPaddingDirection(i);
                        const paddingStyle =
                            paddingDirection === 'left'
                                ? { paddingLeft: '50vw' }
                                : paddingDirection === 'right'
                                    ? { paddingRight: '50vw' }
                                    : {};
                        return (
                            <div
                                key={i}
                                style={paddingStyle}
                            >
                                <PixelatedImage
                                    src={images[i]}
                                    alt={`Image ${i + 1}`}
                                    width={400}
                                    aspectRatio="4/5"
                                    stepDuration={150}
                                    delay={200}
                                    initialPixelSize={40}
                                />
                            </div>
                        );
                    })}
                </div>
            </InfiniteScroll>
        </main>
    );
}
