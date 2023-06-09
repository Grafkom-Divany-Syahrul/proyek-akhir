function drawCube(shadow) {
  mvPushMatrix();
  //item specific modifications
  mat4.scale(mvMatrix, [0.75, 0.75, 0.75]);
  //draw
  setupToDrawCube(shadow);
  setMatrixUniforms(shadow);
  chooseTexture(9, shadow);
  setupMaterial(cameraMaterial, shadow);
  gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  mvPopMatrix(shadow);
}

function drawBox(shadow) {
  mvPushMatrix();
  //item specific modifications
  mat4.scale(mvMatrix, [0.75, 1.5, 0.75]);
  //draw
  setupToDrawCube(shadow);
  setMatrixUniforms(shadow);
  chooseTexture(8, shadow);
  gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  mvPopMatrix(shadow);
}

function initCubeBoxTree() {
  // CUBE
  baseCubeNode = { 'draw': drawCube, 'matrix': mat4.identity(mat4.create()) };
  mat4.translate(baseCubeNode.matrix, [3.0, 3.5, 0.0]);
  mat4.rotate(baseCubeNode.matrix, baseCubeAngle, [0.0, 1.5, -5.0]);

  // BOX
  baseBoxNode = { 'draw': drawBox, 'matrix': mat4.identity(mat4.create()) };
  mat4.translate(baseBoxNode.matrix, [-3.0, 3.5, 0.0]);
  mat4.rotate(baseBoxNode.matrix, baseBoxAngle, [1.5, 0.0, 0.0]);
}