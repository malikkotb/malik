## Initializing the project

Quick one today.

Let's start the project by setting up a Next.js app with TypeScript and utilizing the app router. Just run `npx create-next-app@latest` in the terminal. 

We can clear out all the contents in the page.tsx, and global.css files, and add our own HTML and CSS, to begin with a clean slate in the application.

 - We will use regular CSS for styling.

## Page Component

We will start by creating a function that generates a hex code for a random color.

```typescript
function getRandomHexCode() {
  return "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0");
}
```

Then we can set the random color when hovering over the text. We will call `setColor` using `onMouseEnter` and `onMouseLeave` handlers of the text.

```typescript
const setColor = () => {
    if (!coverRef.current) return;
    const randomColor = getRandomHexCode();
    coverRef.current.style.setProperty("--color", `${randomColor}`);
  };
```

Now we need a way of tracking the position of our mouse. We can do that by adding an event-listener to our window.  

```typescript
  const manageMouseMove = (e: { clientX: any; clientY: any }) => {
    if (!coverRef.current) return;
    const { clientX, clientY } = e;
    coverRef.current.style.setProperty("--x", `${clientX}px`);
    coverRef.current.style.setProperty("--y", `${clientY}px`);
  };

  useEffect(() => {
    window.addEventListener("mousemove", manageMouseMove);
    return () => {
      window.removeEventListener("mousemove", manageMouseMove);
    };
  }, []);
```
- We are tracking the position with the built-in `clientX`and `clientY` properties of the event.
- And setting the position of the center of our gradient to the position of the mouse.

## CSS Module

Where the magic happens...

This CSS code creates a radial gradient background image with customizable position and color.

```css
.cover {
    background-image: radial-gradient(
      circle farthest-side at var(--x, 100px) var(--y, 100px),
      var(--color, #1250aa) 0%,
      transparent 100%
    );
  }
```

- We create a radial background image using `radial-gradient`. The gradient starts from a circle shape and extends to the `farthest-side` of its container (the window).
- The position of the center of the gradient is determined by CSS variables `--x` and `--y`, defaulting to (100px, 100px) which is in the top left corner of the window.
- The gradient starts with a color defined by the CSS variable `--color`, defaulting to #1250aa.
- You can customize the position, width and color to your choosing with CSS variables.
