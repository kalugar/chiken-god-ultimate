export default {
  backgroundColor: '#1099bb',
  autoDensity: true,
  antialias: true,
  hello: true,
  bezierSmoothness: 1,
  culler: {
    updateTransform: false
  },
  eventFeatures: {
    move: true,
    click: true,
    wheel: false,
    globalMove: false
  },
  height: 720,
  preference: 'webgpu' as const,
  resizeTo: window,
  resolution: Math.max(window.devicePixelRatio ?? 1, 1),
  width: 1280
}
