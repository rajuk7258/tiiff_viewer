import React, {useRef, useState, useEffect} from 'react';

export default function App(){
  const [images, setImages] = useState([]);
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({x:0,y:0});
  const [isPanning, setIsPanning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSlideshow, setIsSlideshow] = useState(false);
  const slideshowRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  const cryptoRandomId = ()=> Math.random().toString(36).slice(2,9);

  const loadFiles = async (fileList) => {
    const arr = Array.from(fileList);
    const loaded = [];
    for(const f of arr){
      const src = URL.createObjectURL(f);
      loaded.push({id: cryptoRandomId(), src, name: f.name});
    }
    if(loaded.length){
      setImages(prev => [...prev, ...loaded]);
      setIndex(prev => (prev || 0));
    }
  };

  useEffect(()=>{
    const onDrop = (e)=>{
      e.preventDefault();
      if(e.dataTransfer && e.dataTransfer.files) loadFiles(e.dataTransfer.files);
    };
    const onDragOver = (e)=> e.preventDefault();
    window.addEventListener('drop', onDrop);
    window.addEventListener('dragover', onDragOver);
    return ()=>{ window.removeEventListener('drop', onDrop); window.removeEventListener('dragover', onDragOver);} ;
  }, []);

  useEffect(()=>{
    const onKey = (e)=>{
      if(e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if(e.key === 'ArrowRight') next();
      if(e.key === 'ArrowLeft') prev();
      if(e.key === '+') setZoom(z=>Math.min(8,z*1.25));
      if(e.key === '-') setZoom(z=>Math.max(0.1,z/1.25));
      if(e.key === 'f' || e.key === 'F') toggleFullscreen();
      if(e.key === ' '){ e.preventDefault(); toggleSlideshow(); }
      if(e.key === 'r' || e.key === 'R') rotate(90);
    };
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  }, [index, images]);

  const resetView = ()=>{ setZoom(1); setRotation(0); setPan({x:0,y:0}); };

  const next = ()=>{ setIndex(i=> Math.min(images.length-1, i+1)); resetView(); };
  const prev = ()=>{ setIndex(i=> Math.max(0, i-1)); resetView(); };
  const rotate = (deg)=> setRotation(r => (r + deg) % 360);

  const toggleFullscreen = ()=>{
    const el = containerRef.current;
    if(!el) return;
    if(!document.fullscreenElement){ el.requestFullscreen().catch(()=>{}); setIsFullscreen(true);} else { document.exitFullscreen().catch(()=>{}); setIsFullscreen(false);}  
  };

  useEffect(()=>{
    if(isSlideshow){
      slideshowRef.current = setInterval(()=>{
        setIndex(i=> (i+1) % images.length);
        resetView();
      }, 2500);
    } else {
      clearInterval(slideshowRef.current);
    }
    return ()=> clearInterval(slideshowRef.current);
  }, [isSlideshow, images.length]);

  const toggleSlideshow = ()=>{
    if(images.length === 0) return;
    setIsSlideshow(s=>!s);
  };

  const onWheel = (e)=>{
    if(e.ctrlKey || e.metaKey){
      e.preventDefault();
      const delta = e.deltaY > 0 ? 1/1.1 : 1.1;
      setZoom(z => Math.max(0.05, Math.min(16, z * delta)));
    }
  };

  const startPan = (e)=>{
    if(e.button !== 0) return;
    setIsPanning(true);
    e.currentTarget.style.cursor = 'grabbing';
    e.currentTarget.dataset.startX = e.clientX;
    e.currentTarget.dataset.startY = e.clientY;
    e.currentTarget.dataset.panX = pan.x;
    e.currentTarget.dataset.panY = pan.y;
  };
  const movePan = (e)=>{
    if(!isPanning) return;
    const el = e.currentTarget;
    const dx = e.clientX - Number(el.dataset.startX || 0);
    const dy = e.clientY - Number(el.dataset.startY || 0);
    const baseX = Number(el.dataset.panX || 0);
    const baseY = Number(el.dataset.panY || 0);
    setPan({x: baseX + dx, y: baseY + dy});
  };
  const endPan = (e)=>{ setIsPanning(false); if(e.currentTarget) e.currentTarget.style.cursor='default'; };

  const onFilesChange = (e)=>{
    if(e.target.files) loadFiles(e.target.files);
    e.target.value = null;
  };

  const removeAt = (i)=>{
    setImages(prev=>{
      const copy = [...prev];
      const removed = copy.splice(i,1);
      if(removed && removed[0] && removed[0].src) URL.revokeObjectURL(removed[0].src);
      if(copy.length===0) { setIndex(0); resetView(); }
      else if(i <= index && index>0) setIndex(index-1);
      return copy;
    });
  };

  const imageStyle = {
    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
    transition: isPanning ? 'none' : 'transform 120ms ease-out',
    touchAction: 'none',
    maxWidth: 'none',
    maxHeight: 'none',
    willChange: 'transform'
  };

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Fast Image Viewer — Web Clone</h1>
        <div className="controls">
          <button className="btn" onClick={()=>fileInputRef.current?.click()}>Open</button>
          <button className="btn" onClick={()=>{ setZoom(z=>Math.min(8,z*1.25)); }}>+</button>
          <button className="btn" onClick={()=>{ setZoom(z=>Math.max(0.1,z/1.25)); }}>-</button>
          <button className="btn" onClick={()=>rotate(90)}>Rotate</button>
          <button className="btn" onClick={toggleFullscreen}>{isFullscreen? 'Exit FS' : 'Fullscreen'}</button>
          <button className="btn" onClick={toggleSlideshow}>{isSlideshow? 'Stop' : 'Slideshow'}</button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*,application/octet-stream" multiple className="hidden" onChange={onFilesChange} />
      </header>

      <main ref={containerRef} onWheel={onWheel} className="viewer" >
        {images.length === 0 ? (
          <div className="empty">
            <div>
              <p>Drag & drop images here or click <button className="link" onClick={()=>fileInputRef.current?.click()}>Open</button></p>
              <p className="hint">Supports JPEG, PNG, GIF. For TIFF integrate UTIF.js (see README).</p>
            </div>
          </div>
        ) : (
          <div className="viewer-inner">
            <div className="image-area"
                 onMouseDown={startPan} onMouseMove={movePan} onMouseUp={endPan} onMouseLeave={endPan}>
              <img
                src={images[index].src}
                alt={images[index].name}
                draggable={false}
                style={imageStyle}
                className="display-img"
              />
              <button className="nav left" onClick={prev}>◀</button>
              <button className="nav right" onClick={next}>▶</button>
              <div className="caption">{images[index].name}</div>
            </div>
            <div className="thumb-strip">
              {images.map((im, i)=> (
                <div key={im.id} className={`thumb ${i===index? 'active':''}`}>
                  <img src={im.src} alt={im.name} onClick={()=>{ setIndex(i); resetView(); }} />
                  <button className="remove" onClick={()=>removeAt(i)}>✕</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <div>Index: {images.length ? index+1 : 0}/{images.length}</div>
        <div>| Zoom: {Math.round(zoom*100)}%</div>
        <div>| Rotation: {rotation}°</div>
        <div className="shortcuts">Shortcuts: ← → • +/− • F (fullscreen) • Space (slideshow)</div>
      </footer>
    </div>
  );
}
