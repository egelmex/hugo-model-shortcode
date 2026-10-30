/* the model shortcode: an interactive view of each figure[data-model] (.stl, .3mf or .obj), built when it nears the viewport.
   Loaded as a module on pages with a model (partials/model-head.html), with three.js imported only when first needed.
   Renders on demand, so an idle model costs nothing. The canvas is transparent: the stage's background shows through. */
var root=document.documentElement,CREASE=30*Math.PI/180,FOV=30;
var figs=document.querySelectorAll('figure[data-model]'),libs;
function load(){return libs||(libs=Promise.all([
  import('three'),import('three/addons/controls/OrbitControls.js'),import('three/addons/loaders/STLLoader.js'),
  import('three/addons/loaders/3MFLoader.js'),import('three/addons/loaders/OBJLoader.js'),import('three/addons/utils/BufferGeometryUtils.js')]))}

async function build(fig){
  var stage=fig.querySelector('.model__stage'),view=fig.querySelector('.model__view'),status=fig.querySelector('.model__status');
  try{
    var [THREE,{OrbitControls},{STLLoader},{ThreeMFLoader},{OBJLoader},{toCreasedNormals}]=await load();
    var stl=fig.dataset.format==='stl',data=await new ({stl:STLLoader,'3mf':ThreeMFLoader,obj:OBJLoader}[fig.dataset.format])().loadAsync(fig.dataset.model);
    var object=stl?new THREE.Mesh(data):data;

    /* the shortcode's modes; the colour comes from CSS (.model__view), so the theme and the color param both reach it */
    var side=THREE.DoubleSide,materials={
      solid:new THREE.MeshStandardMaterial({roughness:.75,side:side}),
      flat:new THREE.MeshStandardMaterial({roughness:.75,side:side,flatShading:true}),
      wireframe:new THREE.LineBasicMaterial(), /* drawn by the mesh's edges, below */
      none:new THREE.MeshBasicMaterial({visible:false}),
      xray:new THREE.MeshBasicMaterial({transparent:true,opacity:.15,depthWrite:false,side:side}),
      normals:new THREE.MeshNormalMaterial({side:side})};
    function tint(){var c=getComputedStyle(view).color;Object.values(materials).forEach(function(m){if(m.color)m.color.set(c)})}
    tint();
    var meshes=[],modes=fig.dataset.modes.split(',');
    object.traverse(function(o){if(o.isMesh){o.geometry=toCreasedNormals(o.geometry,CREASE);meshes.push(o)}});
    /* wireframe is only the creases, not every triangle, which on a flat face is just noise; built the first time it's needed */
    function setMode(name){var wire=name==='wireframe';meshes.forEach(function(o){
      if(wire&&!o.userData.edges){o.userData.edges=new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry,CREASE*180/Math.PI),materials.wireframe);o.add(o.userData.edges)}
      if(o.userData.edges)o.userData.edges.visible=wire;
      o.material=wire?materials.none:materials[name]})}
    setMode(modes[0]);

    /* all the formats are in print coordinates, Z up; centre the model and fit it, whatever the stage's shape */
    var scene=new THREE.Scene(),holder=new THREE.Group();
    holder.add(object);scene.add(holder);
    var box=new THREE.Box3().setFromObject(holder),sphere=box.getBoundingSphere(new THREE.Sphere());
    holder.position.sub(sphere.center);
    var w=view.clientWidth,h=view.clientHeight,camera=new THREE.PerspectiveCamera(FOV,w/h,.1,1);
    var half=Math.atan(Math.tan(FOV*Math.PI/360)*Math.min(w/h,1)),dist=sphere.radius/Math.sin(half)*1.05;
    camera.up.set(0,0,1);
    var rot=fig.dataset.rotation.split(',').map(THREE.MathUtils.degToRad);
    camera.position.set(Math.sin(rot[0])*Math.cos(rot[1]),-Math.cos(rot[0])*Math.cos(rot[1]),Math.sin(rot[1])).setLength(dist);
    camera.near=dist/100;camera.far=dist*10;camera.updateProjectionMatrix();
    /* lit from beside the camera, so no angle leaves the model in the dark */
    var hemi=new THREE.HemisphereLight(0xffffff,0x8a8078,1.6),key=new THREE.DirectionalLight(0xffffff,1.6);
    hemi.position.set(0,0,1);key.position.set(-.6,.8,1);
    camera.add(key,key.target);key.target.position.set(0,0,-1);
    scene.add(hemi,camera);

    var renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    view.append(renderer.domElement);
    function render(){renderer.render(scene,camera)}
    function size(){var w=view.clientWidth,h=view.clientHeight;if(!w||!h)return;
      renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();render()}

    var controls=new OrbitControls(camera,renderer.domElement);
    controls.saveState();
    controls.addEventListener('change',render);
    renderer.domElement.style.touchAction='pan-y'; /* OrbitControls' none would trap a swipe down the page */
    view.addEventListener('wheel',function(e){if(!e.ctrlKey&&!e.metaKey)e.stopPropagation()},{capture:true,passive:true}); /* a plain wheel scrolls the page */
    view.addEventListener('dblclick',function(){controls.reset()});

    var hint=document.createElement('span');hint.className='model__hint';
    hint.textContent=matchMedia('(pointer:coarse)').matches?'drag to rotate':'drag to rotate, ctrl+scroll to zoom';
    stage.append(hint);
    controls.addEventListener('start',function(){hint.classList.add('is-used')},{once:true});

    if(modes.length>1){
      var bar=document.createElement('div');bar.className='model__modes';bar.setAttribute('role','group');bar.setAttribute('aria-label','View mode');
      modes.forEach(function(name,i){
        var b=document.createElement('button');b.type='button';b.textContent=name;b.setAttribute('aria-pressed',i===0);
        b.addEventListener('click',function(){setMode(name);render();
          bar.querySelectorAll('button').forEach(function(o){o.setAttribute('aria-pressed',o===b)})});
        bar.append(b)});
      stage.append(bar)}

    new ResizeObserver(size).observe(view);
    /* a theme toggle usually changes something on <html>; the colour can follow either that or the system */
    function retint(){tint();render()}
    new MutationObserver(retint).observe(root,{attributes:true});
    matchMedia('(prefers-color-scheme:dark)').addEventListener('change',retint);
    /* a canvas prints blank unless it has only just been drawn, so print a picture of it */
    var print=document.createElement('img');print.className='model__print';print.alt='';view.append(print);
    addEventListener('beforeprint',function(){render();print.src=renderer.domElement.toDataURL('image/png')});

    size();
    status.hidden=true;
    stage.classList.add('is-ready');
  }catch(err){
    console.error(err);
    status.textContent='3D preview unavailable';
    stage.classList.add('is-failed');
  }
}

var io=new IntersectionObserver(function(es){es.forEach(function(e){
  if(e.isIntersecting){io.unobserve(e.target);build(e.target)}})},{rootMargin:'200px'});
figs.forEach(function(f){io.observe(f)});
