# Fast Image Viewer - Web (Clone)

This is a lightweight web clone of the **Fast Image Viewer** features — built with React + Vite.

## Features
- Drag & drop or open files
- Thumbnail strip
- Zoom (wheel with Ctrl/Cmd), pan (drag), rotation
- Fullscreen toggle
- Slideshow mode
- Keyboard shortcuts

## Notes
- Browsers do not natively render multipage TIFF. To add TIFF support, integrate [UTIF.js](https://github.com/photopea/UTIF.js) and decode pages into images before adding them to the UI.
- For EXIF metadata display and orientation handling, integrate a library like `exif-js`.

## Run locally
```bash
npm install
npm run dev
```

This uses Vite. The dev server will open at `http://localhost:5173` by default.

## PWA
A minimal `manifest.json` and `public/sw.js` are included. You can expand the service worker caching strategy for offline usage.

## License
MIT
