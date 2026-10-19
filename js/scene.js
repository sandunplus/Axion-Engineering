(function () {
  var canvas = document.querySelector("[data-scene]");
  var stage = document.querySelector("[data-stage]");
  var caption = document.querySelector("[data-stage-caption]");
  if (!canvas || !stage || !window.THREE) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var THREE = window.THREE;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
  } catch (error) {
    return;
  }

  if (!renderer || !renderer.getContext()) return;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(34, 1, 0.1, 50);
  camera.position.set(0, 0.15, 8.6);

  var pmrem = new THREE.PMREMGenerator(renderer);
  var env = new THREE.Scene();
  env.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(24, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0x9a9c94, side: THREE.BackSide })
    )
  );

  [
    { color: 0xfff0d2, position: [5, 6, 3], scale: 3.2 },
    { color: 0xd5e4f2, position: [-6, 2, -2], scale: 2.8 },
    { color: 0xef4823, position: [1, -5, 4], scale: 2.4 },
    { color: 0xfffaf2, position: [-2, 3, 6], scale: 2.2 },
  ].forEach(function (light) {
    var mesh = new THREE.Mesh(
      new THREE.SphereGeometry(1, 16, 16),
      new THREE.MeshBasicMaterial({ color: light.color })
    );
    mesh.position.set(light.position[0], light.position[1], light.position[2]);
    mesh.scale.setScalar(light.scale);
    env.add(mesh);
  });

  scene.environment = pmrem.fromScene(env, 0.05).texture;
  pmrem.dispose();

  scene.add(new THREE.AmbientLight(0xfff4e6, 0.55));
  scene.add(new THREE.HemisphereLight(0xfff1dc, 0x2a2c28, 0.45));

  var key = new THREE.DirectionalLight(0xfff1d6, 3.1);
  key.position.set(4, 6, 5);
  scene.add(key);

  var rim = new THREE.DirectionalLight(0xc5d7e8, 1.8);
  rim.position.set(-6, 2, -3);
  scene.add(rim);

  var fill = new THREE.PointLight(0xef4823, 10, 20);
  fill.position.set(0.4, 0.2, 4.5);
  scene.add(fill);

  var brass = new THREE.MeshPhysicalMaterial({
    color: 0xef4823,
    metalness: 0.62,
    roughness: 0.28,
    clearcoat: 0.35,
    clearcoatRoughness: 0.22,
    emissive: 0x6a1408,
    emissiveIntensity: 0.22,
  });
  var steel = new THREE.MeshPhysicalMaterial({
    color: 0xe7e2d6,
    metalness: 0.72,
    roughness: 0.28,
    emissive: 0x242622,
    emissiveIntensity: 0.06,
  });
  var inkMetal = new THREE.MeshPhysicalMaterial({
    color: 0xa8b0a6,
    metalness: 0.68,
    roughness: 0.32,
  });

  var root = new THREE.Group();
  scene.add(root);

  var core = new THREE.Mesh(new THREE.OctahedronGeometry(1.28, 0), brass);
  core.rotation.set(0.42, 0.62, 0.12);
  root.add(core);

  var axle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 3.55, 24), steel);
  axle.rotation.z = Math.PI / 2;
  root.add(axle);

  var hub = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.28, 32), inkMetal);
  hub.rotation.z = Math.PI / 2;
  root.add(hub);

  var ringA = new THREE.Mesh(new THREE.TorusGeometry(1.85, 0.028, 16, 180), steel);
  ringA.rotation.x = Math.PI / 2.35;
  root.add(ringA);

  var ringB = new THREE.Mesh(new THREE.TorusGeometry(2.15, 0.02, 12, 180), brass);
  ringB.rotation.y = Math.PI / 3;
  root.add(ringB);

  var base = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.012, 10, 120), inkMetal);
  base.rotation.x = Math.PI / 2;
  base.position.y = -1.48;
  root.add(base);

  for (var i = 0; i < 5; i += 1) {
    var angle = (i / 5) * Math.PI * 2;
    var pin = new THREE.Mesh(new THREE.SphereGeometry(0.075, 20, 16), i % 2 ? brass : steel);
    pin.position.set(Math.cos(angle) * 2.15, Math.sin(angle) * 0.42, Math.sin(angle) * 2.15);
    pin.userData.angle = angle;
    root.add(pin);
  }

  var pointer = { x: 0, y: 0 };
  var target = { x: 0, y: 0 };

  if (finePointer && !reduceMotion) {
    stage.addEventListener("pointermove", function (event) {
      var rect = stage.getBoundingClientRect();
      target.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      target.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    });
    stage.addEventListener("pointerleave", function () {
      target.x = 0;
      target.y = 0;
    });
  }

  var clock = new THREE.Clock();
  var frame = 0;
  var running = true;

  function resize() {
    var width = stage.clientWidth;
    var height = stage.clientHeight;
    if (!width || !height) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  if ("ResizeObserver" in window) {
    new ResizeObserver(resize).observe(stage);
  } else {
    window.addEventListener("resize", resize);
  }
  resize();

  document.addEventListener("visibilitychange", function () {
    running = !document.hidden;
    if (running) clock.getDelta();
  });

  function render() {
    frame = window.requestAnimationFrame(render);
    if (!running) return;

    var t = clock.getElapsedTime();
    if (!reduceMotion) {
      pointer.x += (target.x - pointer.x) * 0.05;
      pointer.y += (target.y - pointer.y) * 0.05;
      root.rotation.y = t * 0.22 + pointer.x * 0.28;
      root.rotation.x = Math.sin(t * 0.18) * 0.08 + pointer.y * 0.12;
      ringA.rotation.z = t * 0.35;
      ringB.rotation.x = t * 0.22;
      root.children.forEach(function (child) {
        if (child.userData.angle === undefined) return;
        var orbit = child.userData.angle + t * 0.45;
        child.position.set(Math.cos(orbit) * 2.15, Math.sin(orbit) * 0.42, Math.sin(orbit) * 2.15);
      });
    }

    renderer.render(scene, camera);
  }

  stage.classList.add("has-webgl");
  if (caption && !reduceMotion) caption.textContent = "Live study model";
  render();

  window.addEventListener("pagehide", function () {
    window.cancelAnimationFrame(frame);
    renderer.dispose();
  });
})();
