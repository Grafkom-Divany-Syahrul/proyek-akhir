function drawLionBase(shadow) {
  mvPushMatrix();
  //item specific modifications
  mat4.scale(mvMatrix, [1.0, 1.0, 1.0]);
  //draw
  setupToDrawCube(shadow);
  setMatrixUniforms(shadow);
  chooseTexture(6, shadow);
  setupMaterial(cameraMaterial, shadow);
  gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  mvPopMatrix(shadow);
}

function drawLionEars(shadow) {
  mvPushMatrix();
  //item specific modifications
  mat4.scale(mvMatrix, [1.0, 1.0, 1.0]);
  //draw
  setupToDrawCube(shadow);
  setMatrixUniforms(shadow);
  chooseTexture(6, shadow);
  gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  mvPopMatrix(shadow);
}

function drawLionBody(shadow) {
  mvPushMatrix();
  //item specific modifications
  mat4.scale(mvMatrix, [1.0, 1.0, 1.0]);
  //draw
  setupToDrawCube(shadow);
  setMatrixUniforms(shadow);
  chooseTexture(6, shadow);
  gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  mvPopMatrix(shadow);
}

function drawLionLegs(shadow) {
  mvPushMatrix();
  //item specific modifications
  mat4.scale(mvMatrix, [1.0, 1.0, 1.0]);
  //draw
  setupToDrawCube(shadow);
  setMatrixUniforms(shadow);
  chooseTexture(6, shadow);
  gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  mvPopMatrix(shadow);
}

function drawLionTail(shadow) {
  mvPushMatrix();
  //item specific modifications
  mat4.scale(mvMatrix, [1.0, 1.0, 1.0]);
  //draw
  setupToDrawCube(shadow);
  setMatrixUniforms(shadow);
  chooseTexture(6, shadow);
  gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  mvPopMatrix(shadow);
}

function drawLionBeak(shadow) {
  mvPushMatrix();
  //item specific modifications
  mat4.scale(mvMatrix, [1.0, 1.0, 1.0]);
  //draw
  setupToDrawCube(shadow);
  setMatrixUniforms(shadow);
  chooseTexture(6, shadow);
  gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  mvPopMatrix(shadow);
}

function initLionTree() {
  // Lion
  baseLionNode = { 'draw': drawLionBase, 'matrix': mat4.identity(mat4.create()) };
  mat4.translate(baseLionNode.matrix, [0, -3.75, -2.0]);
  mat4.rotate(baseLionNode.matrix, baseLionAngle, [0.0, 1.5, 0.0]);

  firstLionEarNode = { 'draw': drawLionEars, 'matrix': mat4.identity(mat4.create()) };
  mat4.translate(firstLionEarNode.matrix, [0.25, 0.5, 0.45]);
  mat4.rotate(firstLionEarNode.matrix, -lionEarAngle, [0.0, 0.0, 1.0]);
  mat4.translate(firstLionEarNode.matrix, [0.0, 1.0, 0.0]);

  secondLionEarNode = { 'draw': drawLionEars, 'matrix': mat4.identity(mat4.create()) };
  mat4.translate(secondLionEarNode.matrix, [-0.25, 0.5, 0.45]);
  mat4.rotate(secondLionEarNode.matrix, lionEarAngle, [0.0, 0.0, 1.0]);
  mat4.translate(secondLionEarNode.matrix, [0.0, 1.0, 0.0]);

  lionBodyNode = { 'draw': drawLionBody, 'matrix': mat4.identity(mat4.create()) };
  mat4.translate(lionBodyNode.matrix, [0.0, -1.75, -2.5]);

  firstLionLegNode = { 'draw': drawLionLegs, 'matrix': mat4.identity(mat4.create()) };
  mat4.translate(firstLionLegNode.matrix, [-0.75, -1.25, 1.0]);

  secondLionLegNode = { 'draw': drawLionLegs, 'matrix': mat4.identity(mat4.create()) };
  mat4.translate(secondLionLegNode.matrix, [1.5, 0.0, 0.0]);

  thirdLionLegNode = { 'draw': drawLionLegs, 'matrix': mat4.identity(mat4.create()) };
  mat4.translate(thirdLionLegNode.matrix, [0.0, 0.0, -2.25]); //0.2

  fourthLionLegNode = { 'draw': drawLionLegs, 'matrix': mat4.identity(mat4.create()) };
  mat4.translate(fourthLionLegNode.matrix, [-1.0, 0.0, 0.0]); //0.2

  lionBeakNode = { 'draw': drawLionBeak, 'matrix': mat4.identity(mat4.create()) };
  mat4.translate(lionBeakNode.matrix, [0.0, 1.5, 3.5]);

  lionTailNode = { 'draw': drawLionTail, 'matrix': mat4.identity(mat4.create()) };
  mat4.translate(lionTailNode.matrix, [0.0, 1.5, -1.75]);
  mat4.rotate(lionTailNode.matrix, lionTailAngle, [0.0, 0.0, 1.0]);
}