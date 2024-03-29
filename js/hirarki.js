var gl;
var drawType;
var wireframe = false;

var cameraMode = true;

function initGL(canvas) {
  try {
    gl = canvas.getContext('webgl2');
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
  } catch (e) {
  }
  if (!gl) {
    alert('Could not initialise WebGL, sorry :-(');
  }
}

function getShader(gl, id) {
  var shaderScript = document.getElementById(id);
  if (!shaderScript) {
    return null;
  }
  var str = '';
  var k = shaderScript.firstChild;
  while (k) {
    if (k.nodeType == 3) {
      str += k.textContent;
    }
    k = k.nextSibling;
  }
  var shader;
  if (shaderScript.type == 'x-shader/x-fragment') {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == 'x-shader/x-vertex') {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }
  gl.shaderSource(shader, str);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}


//adapted from http://learnwebgl.brown37.net/11_advanced_rendering/shadows.html
function createFrameBufferObject(gl, width, height) {
  var frameBuffer, depthBuffer;

  frameBuffer = gl.createFramebuffer();

  depthBuffer = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, depthBuffer);
  for (var i = 0; i < 6; i++) gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  frameBuffer.depthBuffer = depthBuffer;
  frameBuffer.width = width;
  frameBuffer.height = height;

  return frameBuffer;
}

var shaderProgram;
var shadowMapShaderProgram;

function initShaders() {
  var fragmentShader = getShader(gl, 'fs');
  var vertexShader = getShader(gl, 'vs');
  shaderProgram = gl.createProgram();
  if (!shaderProgram) {
    alert('gak ok deh kakak');
  }
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Could not initialise shaders');
  }
  gl.useProgram(shaderProgram);
  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
  shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, 'aVertexNormal');
  gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
  shaderProgram.vertexTextureAttribute = gl.getAttribLocation(shaderProgram, 'vTexCoord');
  gl.enableVertexAttribArray(shaderProgram.vertexTextureAttribute);
  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, 'uPMatrix');
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, 'uMVMatrix');
  shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, 'uNMatrix');
  shaderProgram.useLightingUniform = gl.getUniformLocation(shaderProgram, 'uUseLighting');
  shaderProgram.useMaterialUniform = gl.getUniformLocation(shaderProgram, 'uUseMaterial');
  shaderProgram.useTextureUniform = gl.getUniformLocation(shaderProgram, 'uUseTexture');
  shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, 'uAmbientColor');
  shaderProgram.pointLightingLocationUniform = gl.getUniformLocation(shaderProgram, 'uPointLightingLocation');
  shaderProgram.pointLightingSpecularColorUniform = gl.getUniformLocation(shaderProgram, 'uPointLightingSpecularColor');
  shaderProgram.pointLightingDiffuseColorUniform = gl.getUniformLocation(shaderProgram, 'uPointLightingDiffuseColor');
  shaderProgram.uMaterialAmbientColorUniform = gl.getUniformLocation(shaderProgram, 'uMaterialAmbientColor');
  shaderProgram.uMaterialDiffuseColorUniform = gl.getUniformLocation(shaderProgram, 'uMaterialDiffuseColor');
  shaderProgram.uMaterialSpecularColorUniform = gl.getUniformLocation(shaderProgram, 'uMaterialSpecularColor');
  shaderProgram.uMaterialShininessUniform = gl.getUniformLocation(shaderProgram, 'uMaterialShininess');
  shaderProgram.uFarPlaneUniform = gl.getUniformLocation(shaderProgram, 'uFarPlane');
  shaderProgram.shadowMapUniform = gl.getUniformLocation(shaderProgram, 'shadowmap');

  var shadowMapFragmentShader = getShader(gl, 'fs-shadowmap');
  var shadowMapVertexShader = getShader(gl, 'vs-shadowmap');
  shadowMapShaderProgram = gl.createProgram();
  gl.attachShader(shadowMapShaderProgram, shadowMapVertexShader);
  gl.attachShader(shadowMapShaderProgram, shadowMapFragmentShader);
  gl.linkProgram(shadowMapShaderProgram);
  if (!gl.getProgramParameter(shadowMapShaderProgram, gl.LINK_STATUS)) {
    alert('Could not initialise shaders');
  }
  gl.useProgram(shadowMapShaderProgram);
  shadowMapShaderProgram.mvMatrixUniform = gl.getUniformLocation(shadowMapShaderProgram, 'uMVMatrix');
  shadowMapShaderProgram.pMatrixUniform = gl.getUniformLocation(shadowMapShaderProgram, 'uPMatrix');
  shadowMapShaderProgram.pointLightingLocationUniform = gl.getUniformLocation(shadowMapShaderProgram, 'uPointLightingLocation');
  shadowMapShaderProgram.uFarPlaneUniform = gl.getUniformLocation(shadowMapShaderProgram, 'uFarPlane');
  shadowMapShaderProgram.vertexPositionAttribute = gl.getAttribLocation(shadowMapShaderProgram, 'aVertexPosition');
  gl.enableVertexAttribArray(shadowMapShaderProgram.vertexPositionAttribute);

  gl.useProgram(shaderProgram);
}

var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();

function mvPushMatrix() {
  var copy = mat4.create();
  mat4.set(mvMatrix, copy);
  mvMatrixStack.push(copy);
}

function mvPopMatrix(shadow) {
  if (mvMatrixStack.length == 0) {
    throw 'Invalid popMatrix!';
  }
  mvMatrix = mvMatrixStack.pop();
  if (shadow) {
    gl.uniformMatrix4fv(shadowMapShaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shadowMapShaderProgram.mvMatrixUniform, false, mvMatrix);
  } else {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    var normalMatrix = mat3.create();
    mat4.toInverseMat3(mvMatrix, normalMatrix);
    mat3.transpose(normalMatrix);
    gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
  }
}

function setMatrixUniforms(shadow) {
  if (shadow) {
    gl.uniformMatrix4fv(shadowMapShaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shadowMapShaderProgram.mvMatrixUniform, false, mvMatrix);
  } else {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    var normalMatrix = mat3.create();
    mat4.toInverseMat3(mvMatrix, normalMatrix);
    mat3.transpose(normalMatrix);
    gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
  }
}

function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

var cubeVertexPositionBuffer;
var cubeVertexNormalBuffer;
var cubeInsidesVertexNormalBuffer;
var cubeVertexIndexBuffer;
var cubeTextureBuffer;

var cylinderVertexPositionBuffer;
var cylinderVertexNormalBuffer;
var cylinderVertexIndexBuffer;
var cylinderTextureBuffer;

var sphereVertexPositionBuffer;
var sphereVertexNormalBuffer;
var sphereVertexIndexBuffer;
var sphereTextureBuffer;

var shadowFrameBuffer;

var armMaterial;
var cameraMaterial;
var roomMaterial;

function initBuffers() {
  //DEFINING CUBE
  cubeVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
  vertices = [
    // Front face
    -1.0, -1.0, 1.0,
    1.0, -1.0, 1.0,
    1.0, 1.0, 1.0,
    -1.0, 1.0, 1.0,
    // Back face
    -1.0, -1.0, -1.0,
    -1.0, 1.0, -1.0,
    1.0, 1.0, -1.0,
    1.0, -1.0, -1.0,
    // Top face
    -1.0, 1.0, -1.0,
    -1.0, 1.0, 1.0,
    1.0, 1.0, 1.0,
    1.0, 1.0, -1.0,
    // Bottom face
    -1.0, -1.0, -1.0,
    1.0, -1.0, -1.0,
    1.0, -1.0, 1.0,
    -1.0, -1.0, 1.0,
    // Right face
    1.0, -1.0, -1.0,
    1.0, 1.0, -1.0,
    1.0, 1.0, 1.0,
    1.0, -1.0, 1.0,
    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0, 1.0,
    -1.0, 1.0, 1.0,
    -1.0, 1.0, -1.0,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  cubeVertexPositionBuffer.itemSize = 3;
  cubeVertexPositionBuffer.numItems = 24;
  cubeVertexNormalBuffer = gl.createBuffer();
  cubeInsidesVertexNormalBuffer = gl.createBuffer();
  var vertexNormals = [
    // Front face
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    // Back face
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
    // Top face
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    // Bottom face
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    // Right face
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    // Left face
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
  ];
  var vertexInsidesNormals = [];
  for (var i = 0; i < vertexNormals.length; i++) {
    vertexInsidesNormals.push(vertexNormals[i] * -1);
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
  cubeVertexNormalBuffer.itemSize = 3;
  cubeVertexNormalBuffer.numItems = 24;

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeInsidesVertexNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexInsidesNormals), gl.STATIC_DRAW);
  cubeInsidesVertexNormalBuffer.itemSize = 3;
  cubeInsidesVertexNormalBuffer.numItems = 24;

  cubeVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
  var cubeVertexIndices = [
    0, 1, 2, 0, 2, 3,    // Front face
    4, 5, 6, 4, 6, 7,    // Back face
    8, 9, 10, 8, 10, 11,  // Top face
    12, 13, 14, 12, 14, 15, // Bottom face
    16, 17, 18, 16, 18, 19, // Right face
    20, 21, 22, 20, 22, 23,  // Left face
  ];
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
  cubeVertexIndexBuffer.itemSize = 1;
  cubeVertexIndexBuffer.numItems = 36;

  var textureCubeCoords = [
    // Front face
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,

    // Back face
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,

    // Top face
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,

    // Bottom face
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,

    // Right face
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,

    // Left face
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
  ];
  cubeTextureBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeTextureBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCubeCoords), gl.STATIC_DRAW);
  cubeTextureBuffer.itemSize = 2;
  cubeTextureBuffer.numItems = 24;

  //DEFINING SPHERE
  var latitudeBands = 30;
  var longitudeBands = 30;
  var radius = 0.5;
  var vertexPositionData = [];
  var normalData = [];
  for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
    var theta = latNumber * Math.PI / latitudeBands;
    var sinTheta = Math.sin(theta);
    var cosTheta = Math.cos(theta);
    for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
      var phi = longNumber * 2 * Math.PI / longitudeBands;
      var sinPhi = Math.sin(phi);
      var cosPhi = Math.cos(phi);
      var x = cosPhi * sinTheta;
      var y = cosTheta;
      var z = sinPhi * sinTheta;
      var u = 1 - (longNumber / longitudeBands);
      var v = 1 - (latNumber / latitudeBands);
      normalData.push(-x);
      normalData.push(-y);
      normalData.push(-z);
      vertexPositionData.push(radius * x);
      vertexPositionData.push(radius * y);
      vertexPositionData.push(radius * z);
    }
  }
  var indexData = [];
  for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
    for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
      var first = (latNumber * (longitudeBands + 1)) + longNumber;
      var second = first + longitudeBands + 1;
      indexData.push(first);
      indexData.push(second);
      indexData.push(first + 1);
      indexData.push(second);
      indexData.push(second + 1);
      indexData.push(first + 1);
    }
  }
  sphereVertexNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
  sphereVertexNormalBuffer.itemSize = 3;
  sphereVertexNormalBuffer.numItems = normalData.length / 3;
  sphereVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
  sphereVertexPositionBuffer.itemSize = 3;
  sphereVertexPositionBuffer.numItems = vertexPositionData.length / 3;
  sphereVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STREAM_DRAW);
  sphereVertexIndexBuffer.itemSize = 1;
  sphereVertexIndexBuffer.numItems = indexData.length;

  //don't use textures for spheres. Thus, mark all as 0
  sphereTextureBuffer = gl.createBuffer();
  var sphereTextures = [];
  for (var i = 0; i < normalData.length / 3; i++) {
    sphereTextures.push(0.0, 0.0);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, sphereTextureBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereTextures), gl.STATIC_DRAW);
  sphereTextureBuffer.itemSize = 2;
  sphereTextureBuffer.numItems = normalData.length / 3;

  shadowFrameBuffer = createFrameBufferObject(gl, 512, 512);
}

function initializeAtrributes() {
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
  gl.vertexAttribPointer(shadowMapShaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, cubeVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeTextureBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexTextureAttribute, cubeTextureBuffer.itemSize, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
}

function setupToDrawCube(shadow) {
  if (shadow) {
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.vertexAttribPointer(shadowMapShaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
  } else {
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, cubeVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeTextureBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexTextureAttribute, cubeTextureBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
  }
}

function setupToDrawCubeInsides(shadow) {
  if (shadow) {
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.vertexAttribPointer(shadowMapShaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
  } else {
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeInsidesVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, cubeInsidesVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeTextureBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexTextureAttribute, cubeTextureBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
  }
}

function setupToDrawSphere(shadow) {
  if (shadow) {
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
    gl.vertexAttribPointer(shadowMapShaderProgram.vertexPositionAttribute, sphereVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer);
  } else {
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, sphereVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, sphereVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereTextureBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexTextureAttribute, sphereTextureBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer);
  }
}

function setupMaterialBrass() {
  gl.uniform3f(shaderProgram.uMaterialAmbientColorUniform, 0.329412, 0.223529, 0.027451);
  gl.uniform3f(shaderProgram.uMaterialDiffuseColorUniform, 0.780392, 0.568627, 0.113725);
  gl.uniform3f(shaderProgram.uMaterialSpecularColorUniform, 0.992157, 0.941176, 0.807843);
  gl.uniform1f(shaderProgram.uMaterialShininessUniform, 27.8974);
}

function setupMaterialBronze() {
  gl.uniform3f(shaderProgram.uMaterialAmbientColorUniform, 0.2125, 0.1275, 0.054);
  gl.uniform3f(shaderProgram.uMaterialDiffuseColorUniform, 0.714, 0.4284, 0.18144);
  gl.uniform3f(shaderProgram.uMaterialSpecularColorUniform, 0.393548, 0.271906, 0.166721);
  gl.uniform1f(shaderProgram.uMaterialShininessUniform, 25.6);
}

function setupMaterialChrome() {
  gl.uniform3f(shaderProgram.uMaterialAmbientColorUniform, 0.25, 0.25, 0.25);
  gl.uniform3f(shaderProgram.uMaterialDiffuseColorUniform, 0.4, 0.4, 0.4774597);
  gl.uniform3f(shaderProgram.uMaterialSpecularColorUniform, 0.774597, 0.271906, 0.774597);
  gl.uniform1f(shaderProgram.uMaterialShininessUniform, 76.8);
}

function setupMaterial(material, shadow) {
  if (!shadow) {
    gl.uniform1i(shaderProgram.useMaterialUniform, true);
    if (material == 'brass') {
      setupMaterialBrass();
    } else if (material == 'bronze') {
      setupMaterialBronze();
    } else if (material == 'chrome') {
      setupMaterialChrome();
    } else if (material == 'none') {
      setupMaterialChrome();
      gl.uniform1i(shaderProgram.useMaterialUniform, false);
    }
  }
}

function chooseTexture(i, shadow) {
  if (!shadow) gl.uniform1i(gl.getUniformLocation(shaderProgram, 'thetexture'), i);
}


var animating = 1;

var lightSourceNode;
var roomNode;

var ostrichBaseNode;
var ostrichBaseAngle = 0;
var ostrichFirstWingNode;
var ostrichWingAngle = 0;
var ostrichSecondWingNode;
var ostrichWingDirection = 1;
var ostrichHeadNode;
var ostrichHeadAngle = 0;
var ostrichTopLipAngle = 0;
var ostrichBottomLipAngle = 0;
var ostrichHeadDirection = 1;
var ostrichTopLipNodeDirection = 1;
var ostrichBottomLipNodeDirection = 1;
var ostrichBottomLip;
var ostrichTopLipNode;
var ostrichFirstLegNode;
var ostrichSecondLegNode;
var ostrichFirstFootNode;
var ostrichSecondFootNode;

var baseGiraffeNode;
var baseGiraffeAngle = 0;
var firstGiraffeEarNode;
var giraffeEarAngle = 0;
var giraffeEarDirection = 1;
var secondGiraffeEarNode;
var thirdCameraLegNode;
var giraffeBodyNode;
var firstGiraffeLegNode;
var secondGiraffeLegNode;
var thirdGiraffeLegNode;
var fourthGiraffeLegNode;
var giraffeTailNodeFirst;
var giraffeTailNodeSecond;
var giraffeTailAngle = 0;
var giraffeTailDirection = 1;
var giraffeBeakNode;

var baseLionNode;
var baseLionAngle = 0;
var firstLionEarNode;
var lionEarAngle = 0;
var lionEarDirection = 1;
var secondLionEarNode;
var thirdCameraLegNode;
var thirdCameraLegAngle2 = 0;
var thirdCameraLegDirection2 = 1;
var lionBodyNode;
var firstLionLegNode;
var secondCameraBodyTranslation2 = 0;
var secondCameraBodyDirection2 = 1;
var secondLionLegNode;
var thirdCameraBodyTranslation2 = 0;
var thirdCameraBodyDirection2 = 1;
var thirdLionLegNode;
var fourthCameraBodyTranslation2 = 0;
var fourthCameraBodyDirection2 = 1;
var fourthLionLegNode;
var lensCameraTranslation2 = 0;
var lensCameraDirection2 = 1;
var lionTailNode;
var shutterCameraTranslation2 = 0.45;
var shutterCameraDirection2 = 1;
var lionTailAngle = 0;
var lionTailDirection = 1;
var lionBeakNode;

var baseCubeNode;
var baseCubeAngle = 0;
var baseBoxNode;
var baseBoxAngle = 0;

function drawLightSource(shadow) {
  mvPushMatrix();
  mat4.scale(mvMatrix, [2, 2, 2]);
  //draw
  setupToDrawSphere(shadow);
  setMatrixUniforms(shadow);
  chooseTexture(10, shadow);
  setupMaterial('bronze', shadow);
  gl.drawElements(gl.TRIANGLES, sphereVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  mvPopMatrix(shadow);
}

function drawRoom(shadow) {
  mvPushMatrix();
  //item specific modifications
  mat4.scale(mvMatrix, [20.0, 8.0, 35.0]);
  //draw
  setupToDrawCubeInsides(shadow);
  setMatrixUniforms(shadow);
  chooseTexture(1, shadow);
  setupMaterial(roomMaterial, shadow);
  gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  mvPopMatrix(shadow);
}

function initObjectTree() {
  if (!wireframe) {
    drawType = gl.TRIANGLES;
  } else {
    drawType = gl.LINES;
  }

  lightSourceNode = { 'draw': drawLightSource, 'matrix': mat4.identity(mat4.create()) };
  mat4.translate(lightSourceNode.matrix, [document.getElementById('lightPositionX').value / 10.0, document.getElementById('lightPositionY').value / 10.0, document.getElementById('lightPositionZ').value / 10.0]);

  roomNode = { 'draw': drawRoom, 'matrix': mat4.identity(mat4.create()) };

  initOstrichTree();
  initGiraffeTree();
  initLionTree();
  initCubeBoxTree();

  ostrichBaseNode.child = ostrichHeadNode;
  ostrichHeadNode.sibling = ostrichSecondWingNode;
  ostrichSecondWingNode.sibling = ostrichFirstWingNode;
  ostrichHeadNode.child = ostrichBottomLipNode;
  ostrichBottomLipNode.sibling = ostrichTopLipNode;
  ostrichFirstWingNode.sibling = ostrichFirstLegNode;
  ostrichFirstLegNode.sibling = ostrichSecondLegNode;
  ostrichFirstLegNode.child = ostrichFirstFootNode;
  ostrichSecondLegNode.child = ostrichSecondFootNode;

  ostrichBaseNode.sibling = baseGiraffeNode;
  baseGiraffeNode.child = firstGiraffeEarNode;
  firstGiraffeEarNode.sibling = secondGiraffeEarNode;
  secondGiraffeEarNode.sibling = giraffeBodyNode;
  giraffeBodyNode.child = firstGiraffeLegNode;
  firstGiraffeLegNode.child = secondGiraffeLegNode;
  secondGiraffeLegNode.child = thirdGiraffeLegNode;
  thirdGiraffeLegNode.child = fourthGiraffeLegNode;
  firstGiraffeLegNode.sibling = giraffeTailNodeFirst;
  giraffeTailNodeFirst.sibling = giraffeTailNodeSecond;
  giraffeTailNodeSecond.sibling = giraffeBeakNode;


  baseGiraffeNode.sibling = baseLionNode;
  baseLionNode.child = firstLionEarNode;
  firstLionEarNode.sibling = secondLionEarNode;
  secondLionEarNode.sibling = lionBodyNode;
  lionBodyNode.child = firstLionLegNode;
  firstLionLegNode.child = secondLionLegNode;
  secondLionLegNode.child = thirdLionLegNode;
  thirdLionLegNode.child = fourthLionLegNode;
  firstLionLegNode.sibling = lionTailNode;
  lionTailNode.sibling = lionBeakNode;

  baseLionNode.sibling = baseCubeNode;
  baseCubeNode.sibling = baseBoxNode;
}

function traverse(node, shadow) {
  mvPushMatrix();
  //modifications
  mat4.multiply(mvMatrix, node.matrix);
  //draw
  node.draw(shadow);
  if ('child' in node) traverse(node.child, shadow);
  mvPopMatrix(shadow);
  if ('sibling' in node) traverse(node.sibling, shadow);
}

var shadowMapLookAtMatrix = mat4.create();
var shadowMapPerspectiveMatrix = mat4.create();
var shadowMapTransform = mat4.create();

// a representation of vector 3
// taken from http://learnwebgl.brown37.net/lib/learn_webgl_vector3.js
var Vector3 = function() {

  var self = this;

  /** ---------------------------------------------------------------------
   * Create a new 3-component vector.
   * @param dx Number The change in x of the vector.
   * @param dy Number The change in y of the vector.
   * @param dz Number The change in z of the vector.
   * @return Float32Array A new 3-component vector
   */
  self.create = function(dx, dy, dz) {
    var v = new Float32Array(3);
    v[0] = 0;
    v[1] = 0;
    v[2] = 0;
    if (arguments.length >= 1) {
      v[0] = dx;
    }
    if (arguments.length >= 2) {
      v[1] = dy;
    }
    if (arguments.length >= 3) {
      v[2] = dz;
    }
    return v;
  };

  /** ---------------------------------------------------------------------
   * Create a new 3-component vector and set its components equal to an existing vector.
   * @param from Float32Array An existing vector.
   * @return Float32Array A new 3-component vector with the same values as "from"
   */
  self.createFrom = function(from) {
    var v = new Float32Array(3);
    v[0] = from[0];
    v[1] = from[1];
    v[2] = from[2];
    return v;
  };

  /** ---------------------------------------------------------------------
   * Create a vector using two existing points.
   * @param tail Float32Array A 3-component point.
   * @param head Float32Array A 3-component point.
   * @return Float32Array A new 3-component vector defined by 2 points
   */
  self.createFrom2Points = function(tail, head) {
    var v = new Float32Array(3);
    self.subtract(v, head, tail);
    return v;
  };

  /** ---------------------------------------------------------------------
   * Copy a 3-component vector into another 3-component vector
   * @param to Float32Array A 3-component vector that you want changed.
   * @param from Float32Array A 3-component vector that is the source of data
   * @returns Float32Array The "to" 3-component vector
   */
  self.copy = function(to, from) {
    to[0] = from[0];
    to[1] = from[1];
    to[2] = from[2];
    return to;
  };

  /** ---------------------------------------------------------------------
   * Set the components of a 3-component vector.
   * @param v Float32Array The vector to change.
   * @param dx Number The change in x of the vector.
   * @param dy Number The change in y of the vector.
   * @param dz Number The change in z of the vector.
   */
  self.set = function(v, dx, dy, dz) {
    v[0] = dx;
    v[1] = dy;
    v[2] = dz;
  };

  /** ---------------------------------------------------------------------
   * Calculate the length of a vector.
   * @param v Float32Array A 3-component vector.
   * @return Number The length of a vector
   */
  self.length = function(v) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  };

  /** ---------------------------------------------------------------------
   * Make a vector have a length of 1.
   * @param v Float32Array A 3-component vector.
   * @return Float32Array The input vector normalized to unit length. Or null if the vector is zero length.
   */
  self.normalize = function(v) {
    var length, percent;

    length = self.length(v);
    if (Math.abs(length) < 0.0000001) {
      return null; // Invalid vector
    }

    percent = 1.0 / length;
    v[0] = v[0] * percent;
    v[1] = v[1] * percent;
    v[2] = v[2] * percent;
    return v;
  };

  /** ---------------------------------------------------------------------
   * Add two vectors:  result = V0 + v1
   * @param result Float32Array A 3-component vector.
   * @param v0 Float32Array A 3-component vector.
   * @param v1 Float32Array A 3-component vector.
   */
  self.add = function(result, v0, v1) {
    result[0] = v0[0] + v1[0];
    result[1] = v0[1] + v1[1];
    result[2] = v0[2] + v1[2];
  };

  /** ---------------------------------------------------------------------
   * Subtract two vectors:  result = v0 - v1
   * @param result Float32Array A 3-component vector.
   * @param v0 Float32Array A 3-component vector.
   * @param v1 Float32Array A 3-component vector.
   */
  self.subtract = function(result, v0, v1) {
    result[0] = v0[0] - v1[0];
    result[1] = v0[1] - v1[1];
    result[2] = v0[2] - v1[2];
  };

  /** ---------------------------------------------------------------------
   * Scale a vector:  result = s * v0
   * @param result Float32Array A 3-component vector.
   * @param v0 Float32Array A 3-component vector.
   * @param s Number A scale factor.
   */
  self.scale = function(result, v0, s) {
    result[0] = v0[0] * s;
    result[1] = v0[1] * s;
    result[2] = v0[2] * s;
  };

  /** ---------------------------------------------------------------------
   * Calculate the cross product of 2 vectors: result = v0 x v1 (order matters)
   * @param result Float32Array A 3-component vector.
   * @param v0 Float32Array A 3-component vector.
   * @param v1 Float32Array A 3-component vector.
   */
  self.crossProduct = function(result, v0, v1) {
    result[0] = v0[1] * v1[2] - v0[2] * v1[1];
    result[1] = v0[2] * v1[0] - v0[0] * v1[2];
    result[2] = v0[0] * v1[1] - v0[1] * v1[0];
  };

  /** ---------------------------------------------------------------------
   * Calculate the dot product of 2 vectors
   * @param v0 Float32Array A 3-component vector.
   * @param v1 Float32Array A 3-component vector.
   * @return Number Float32Array The dot product of v0 and v1
   */
  self.dotProduct = function(v0, v1) {
    return v0[0] * v1[0] + v0[1] * v1[1] + v0[2] * v1[2];
  };

  /** ---------------------------------------------------------------------
   * Print a vector on the console.
   * @param name String A description of the vector to be printed.
   * @param v Float32Array A 3-component vector.
   */
  self.print = function(name, v) {
    var maximum, order, digits;

    maximum = Math.max(v[0], v[1], v[2]);
    order = Math.floor(Math.log(maximum) / Math.LN10 + 0.000000001);
    digits = (order <= 0) ? 5 : (order > 5) ? 0 : (5 - order);

    console.log('Vector3: ' + name + ': ' + v[0].toFixed(digits) + ' '
      + v[1].toFixed(digits) + ' '
      + v[2].toFixed(digits));
  };
};

var V = new Vector3();
var center = V.create();
var eye = V.create();
var up = V.create();
var u = V.create();
var v = V.create();
var n = V.create();

// a method to generate lookat matrix
// taken from http://learnwebgl.brown37.net/lib/learn_webgl_matrix.js because mat4.lookat seems buggy
lookAt = function(M, eye_x, eye_y, eye_z, center_x, center_y, center_z, up_dx, up_dy, up_dz) {

  // Local coordinate system for the camera:
  //   u maps to the x-axis
  //   v maps to the y-axis
  //   n maps to the z-axis

  V.set(center, center_x, center_y, center_z);
  V.set(eye, eye_x, eye_y, eye_z);
  V.set(up, up_dx, up_dy, up_dz);

  V.subtract(n, eye, center);  // n = eye - center
  V.normalize(n);

  V.crossProduct(u, up, n);
  V.normalize(u);

  V.crossProduct(v, n, u);
  V.normalize(v);

  var tx = -V.dotProduct(u, eye);
  var ty = -V.dotProduct(v, eye);
  var tz = -V.dotProduct(n, eye);

  // Set the camera matrix
  M[0] = u[0];
  M[4] = u[1];
  M[8] = u[2];
  M[12] = tx;
  M[1] = v[0];
  M[5] = v[1];
  M[9] = v[2];
  M[13] = ty;
  M[2] = n[0];
  M[6] = n[1];
  M[10] = n[2];
  M[14] = tz;
  M[3] = 0;
  M[7] = 0;
  M[11] = 0;
  M[15] = 1;
};

//draws shadowmap for the side of the texture
//0: positive x, ..., 5: negative z
function drawShadowMap(side) {
  var centers = [
    1.0, 0.0, 0.0, //positive x
    -1.0, 0.0, 0.0, //negative x
    0.0, 1.0, 0.0, //positive y
    0.0, -1.0, 0.0, //negative y
    0.0, 0.0, 1.0, //positive z
    0.0, 0.0, -1.0, //negative z
  ];

  var upVectors = [
    0.0, -1.0, 0.0, //positive x
    0.0, -1.0, 0.0, //negative x
    0.0, 0.0, 1.0, //positive y
    0.0, 0.0, -1.0, //negative y
    0.0, -1.0, 0.0, //positive z
    0.0, -1.0, 0.0, //negative z
  ];
  gl.useProgram(shadowMapShaderProgram);
  gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFrameBuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X + side, shadowFrameBuffer.depthBuffer, 0);

  gl.viewport(0, 0, shadowFrameBuffer.width, shadowFrameBuffer.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  shadowMapLookAtMatrix = mat4.create();
  lookAt(shadowMapLookAtMatrix,
    parseFloat($('#lightPositionX').val() / 10.0),
    parseFloat($('#lightPositionY').val() / 10.0),
    parseFloat($('#lightPositionZ').val() / 10.0),
    parseFloat($('#lightPositionX').val() / 10.0) + centers[side * 3],
    parseFloat($('#lightPositionY').val() / 10.0) + centers[side * 3 + 1],
    parseFloat($('#lightPositionZ').val() / 10.0) + centers[side * 3 + 2],
    upVectors[side * 3],
    upVectors[side * 3 + 1],
    upVectors[side * 3 + 2]);
  mat4.perspective(90, shadowFrameBuffer.width / shadowFrameBuffer.height, 0.1, 100.0, shadowMapTransform);
  mat4.multiply(shadowMapTransform, shadowMapLookAtMatrix);
  mat4.set(shadowMapTransform, pMatrix);

  gl.uniform3f(
    shadowMapShaderProgram.pointLightingLocationUniform,
    parseFloat($('#lightPositionX').val() / 10.0),
    parseFloat($('#lightPositionY').val() / 10.0),
    parseFloat($('#lightPositionZ').val() / 10.0),
  );
  gl.uniform1f(shadowMapShaderProgram.uFarPlaneUniform, 100.0);

  mat4.identity(mvMatrix);
  traverse(roomNode, true);
  mat4.translate(mvMatrix, [0, 0, -20]);
  traverse(ostrichBaseNode, true);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

var lookAtMatrix;

function drawScene() {
  lookAtMatrix = mat4.create();
  gl.useProgram(shaderProgram);
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  pMatrix = mat4.create();
  if (cameraMode) {
    lookAt(lookAtMatrix,
      parseFloat($('#eyePosition1').val() / 10.0),
      parseFloat($('#eyePosition2').val() / 10.0),
      parseFloat($('#eyePosition3').val() / 10.0),
      parseFloat($('#centerPosition1').val() / 10.0),
      parseFloat($('#centerPosition2').val() / 10.0),
      parseFloat($('#centerPosition3').val() / 10.0),
      parseFloat($('#upPosition1').val() / 10.0),
      parseFloat($('#upPosition2').val() / 10.0),
      parseFloat($('#upPosition3').val() / 10.0));
    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
    mat4.multiply(pMatrix, lookAtMatrix);
  } else {
    lookAt(lookAtMatrix,
      0.0, 0.0, 5.0,
      0.0, 0.0, 6.0,
      0, 1, 0.0);
    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
    var newMat = mat4.identity(mat4.create());
    baseGiraffeNode.location[2] -= 20;
    baseGiraffeNode.location[1] += 3;
    baseGiraffeNode.location[0] += 7;
    console.log(baseGiraffeNode.location);
    mat4.translate(newMat, baseGiraffeNode.location);
    mat4.rotate(newMat, baseGiraffeNode.rotation, [0.0, 1.0, 0.0]);
    mat4.multiply(pMatrix, lookAtMatrix);
    mat4.multiply(pMatrix, mat4.inverse(newMat, mat4.create()));
  }

  gl.uniform1i(shaderProgram.useLightingUniform, $('#lighting').prop('checked'));
  gl.uniform1i(shaderProgram.useTextureUniform, $('#texture').prop('checked'));

  gl.uniform3f(
    shaderProgram.ambientColorUniform,
    parseFloat($('#ambientR').val()),
    parseFloat($('#ambientG').val()),
    parseFloat($('#ambientB').val()),
  );
  gl.uniform3f(
    shaderProgram.pointLightingLocationUniform,
    parseFloat($('#lightPositionX').val() / 10.0),
    parseFloat($('#lightPositionY').val() / 10.0),
    parseFloat($('#lightPositionZ').val() / 10.0),
  );
  gl.uniform3f(
    shaderProgram.pointLightingDiffuseColorUniform,
    parseFloat($('#pointR').val()),
    parseFloat($('#pointG').val()),
    parseFloat($('#pointB').val()),
  );
  gl.uniform3f(
    shaderProgram.pointLightingSpecularColorUniform,
    parseFloat($('#pointR').val()),
    parseFloat($('#pointG').val()),
    parseFloat($('#pointB').val()),
  );

  gl.activeTexture(gl.TEXTURE31);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, shadowFrameBuffer.depthBuffer);
  gl.uniform1i(shaderProgram.shadowMapUniform, 31);

  gl.uniform1f(shaderProgram.uFarPlaneUniform, 100.0);

  mat4.identity(mvMatrix);
  traverse(lightSourceNode, false);
  traverse(roomNode, false);

  mat4.translate(mvMatrix, [0, 0, -20]);
  traverse(ostrichBaseNode, false);

}

function animate() {
  if (animating) {
    var update = (0.05 * Math.PI * 10 / 180);

    //ARM
    ostrichBaseAngle = (ostrichBaseAngle + update) % (2 * Math.PI);
    $('#ostrichBaseAngle').val(ostrichBaseAngle * 180 / (Math.PI));

    ostrichHeadAngle += update * ostrichHeadDirection;
    if (ostrichHeadAngle < -Math.PI / 16 && ostrichHeadDirection == -1) ostrichHeadDirection *= -1;
    if (ostrichHeadAngle > Math.PI / 16 && ostrichHeadDirection == 1) ostrichHeadDirection *= -1;
    $('#ostrichHeadAngle').val(ostrichHeadAngle * 180 / (Math.PI));

    ostrichTopLipAngle += update * ostrichTopLipNodeDirection;
    if (ostrichTopLipAngle < -Math.PI / 8 && ostrichTopLipNodeDirection == -1) ostrichTopLipNodeDirection *= -1;
    if (ostrichTopLipAngle > Math.PI / 8 && ostrichTopLipNodeDirection == 1) ostrichTopLipNodeDirection *= -1;

      ostrichBottomLipAngle += update * ostrichBottomLipNodeDirection;
      if (ostrichBottomLipAngle < Math.PI / 8 && ostrichBottomLipNodeDirection == -1) ostrichBottomLipNodeDirection *= -1;
      if (ostrichBottomLipAngle > Math.PI / 8 && ostrichBottomLipNodeDirection == 1) ostrichBottomLipNodeDirection *= -1;


    ostrichWingAngle += update * ostrichWingDirection;
    if (ostrichWingAngle < 0 && ostrichWingDirection == -1) ostrichWingDirection *= -1;
    if (ostrichWingAngle > Math.PI / 4 && ostrichWingDirection == 1) ostrichWingDirection *= -1;
    $('#ostrichWingAngle').val(ostrichWingAngle * 180 / (Math.PI));

    //Giraffe
    baseGiraffeAngle = (baseGiraffeAngle + update) % (2 * Math.PI);
    $('#baseGiraffeAngle').val(baseGiraffeAngle * 180 / (Math.PI));

    giraffeEarAngle += update * giraffeEarDirection;
    if (giraffeEarAngle < 0 && giraffeEarDirection == -1) giraffeEarDirection *= -1;
    if (giraffeEarAngle > Math.PI / 8 && giraffeEarDirection == 1) giraffeEarDirection *= -1;
    $('#giraffeEarAngle').val(giraffeEarAngle * 180 / (Math.PI));

    giraffeTailAngle += update * giraffeTailDirection;
    if (giraffeTailAngle < -Math.PI / 4 && giraffeTailDirection == -1) giraffeTailDirection *= -1;
    if (giraffeTailAngle > Math.PI / 4 && giraffeTailDirection == 1) giraffeTailDirection *= -1;
    $('#giraffeTailAngle').val(giraffeTailAngle * 180 / (Math.PI));

    // Lion

    baseLionAngle = (baseLionAngle + update) % (2 * Math.PI);
    $('#baseLionAngle').val(baseLionAngle * 180 / (Math.PI));

    lionEarAngle += update * lionEarDirection;
    if (lionEarAngle < 0 && lionEarDirection == -1) lionEarDirection *= -1;
    if (lionEarAngle > Math.PI / 4 && lionEarDirection == 1) lionEarDirection *= -1;
    $('#lionEarAngle').val(lionEarAngle * 180 / (Math.PI));

    lionTailAngle += update * lionTailDirection;
    if (lionTailAngle < -Math.PI / 4 && lionTailDirection == -1) lionTailDirection *= -1;
    if (lionTailAngle > Math.PI / 4 && lionTailDirection == 1) lionTailDirection *= -1;
    $('#lionTailAngle').val(lionTailAngle * 180 / (Math.PI));

    // CUBE AND BOX
    baseCubeAngle = (baseCubeAngle + update) % (Math.PI);
    $('#baseCubeAngle').val(baseCubeAngle * 180 / (Math.PI));

    baseBoxAngle = (baseBoxAngle + update) % (2 * Math.PI);
    $('#baseBoxAngle').val(baseBoxAngle * 90 / (Math.PI));

  }
  initObjectTree();
}

function tick() {
  requestAnimationFrame(tick);
  for (var i = 0; i < 6; i++) {
    drawShadowMap(i);
  }
  drawScene();
  animate();
}

function initInputs() {
  $('#animation').checked = true;
  $('#lighting').checked = true;
  $('#texture').checked = true;
  $('#animation').change(function() {
    animating ^= 1;
    if (animating) $('#tab-ostrich .range, #tab-lion .range, #tab-giraffe .range, #tab-cubebox .range').prop('disabled', true);
    else $('#tab-ostrich .range, #tab-lion .range, #tab-giraffe .range, #tab-cubebox .range').prop('disabled', false);
  });
  $('#wireframe').change(() => wireframe = !wireframe);

  $('#ostrichBaseAngle').on('input', (e) => ostrichBaseAngle = parseFloat(e.target.value) * Math.PI / 180);
  $('#ostrichHeadAngle').on('input', (e) => ostrichHeadAngle = parseFloat(e.target.value) * Math.PI / 180);
  $('#ostrichWingAngle').on('input', (e) => ostrichWingAngle = parseFloat(e.target.value) * Math.PI / 180);

  $('#baseGiraffeAngle').on('input', (e) => baseGiraffeAngle = parseFloat(e.target.value) * Math.PI / 180);
  $('#giraffeEarAngle').on('input', (e) => giraffeEarAngle = parseFloat(e.target.value) * Math.PI / 180);
  
  $('#baseLionAngle').on('input', (e) => baseLionAngle = parseFloat(e.target.value) * Math.PI / 180);
  $('#lionEarAngle').on('input', (e) => lionEarAngle = parseFloat(e.target.value) * Math.PI / 180);
  $('#lionTailAngle').on('input', (e) => lionTailAngle = parseFloat(e.target.value) * Math.PI / 180);

  $('#baseCubeAngle').on('input', (e) => baseCubeAngle = parseFloat(e.target.value) * Math.PI / 180);
  $('#baseBoxAngle').on('input', (e) => baseBoxAngle = parseFloat(e.target.value) * Math.PI / 180);

  $('#camera-select').change((e) => {
    if (e.target.value == 'default') {
      $('#camera-controls .range').prop('disabled', false);
      cameraMode = true;
    } else {
      cameraMode = false;
      $('#camera-controls .range').prop('disabled', true);
    }
  });
}

function configureTexture(image, textureno) {
  var texture = gl.createTexture();
  gl.activeTexture(textureno);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
    gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
    gl.NEAREST_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

}

function initTexture() {
  var image0 = new Image();
  image0.onload = function() {
    configureTexture(image0, gl.TEXTURE0);
  };
  image0.src = 'img/jerapah.jpg';

  var image1 = new Image();
  image1.onload = function() {
    configureTexture(image1, gl.TEXTURE1);
  };
  image1.src = 'img/bg.webp';

  var image2 = new Image();
  image2.onload = function() {
    configureTexture(image2, gl.TEXTURE6);
  }
  image2.src = 'img/singa.jpg';

  var image5 = new Image();
  image5.onload = function() {
    configureTexture(image5, gl.TEXTURE8);
  };
  image5.src = 'img/aether.png';

  var image6 = new Image();
  image6.onload = function() {
    configureTexture(image6, gl.TEXTURE9);
  };
  image6.src = 'img/tesseract.png';

  var image7 = new Image();
  image7.onload = function() {
    configureTexture(image7, gl.TEXTURE10);
  };
  image7.src = 'img/sun.jpg';

  var image8 = new Image();
  image8.onload = function() {
    configureTexture(image8, gl.TEXTURE11);
  };
  image8.src = 'img/white.png';

  var image9 = new Image();
  image9.onload = function() {
    configureTexture(image9, gl.TEXTURE12);
  };
  image9.src = 'img/cream.avif';
}

function webGLStart() {
  var canvas = document.getElementById('canvas');
  armMaterial = document.getElementById('arm-material').value;
  cameraMaterial = document.getElementById('camera-material').value;
  roomMaterial = document.getElementById('room-material').value;
  initGL(canvas);
  initShaders();
  initBuffers();
  initObjectTree();
  initInputs();
  initTexture();
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  initializeAtrributes();
  tick();

  $('.tab').click(function() {
    $('.tab').removeClass('tab-active');
    const tab = $(this);
    const tabFor = tab.attr('for');
    tab.addClass('tab-active');
    $('#tab-general, #tab-ostrich, #tab-giraffe, #tab-lion, #tab-cubebox').addClass('hidden');
    if (tabFor == 'general') $('#tab-general').removeClass('hidden');
    else if (tabFor == 'ostrich') $('#tab-ostrich').removeClass('hidden');
    else if (tabFor == 'giraffe') $('#tab-giraffe').removeClass('hidden');
    else if (tabFor == 'lion') $('#tab-lion').removeClass('hidden');
    else if (tabFor == 'cubebox') $('#tab-cubebox').removeClass('hidden');
  });
}