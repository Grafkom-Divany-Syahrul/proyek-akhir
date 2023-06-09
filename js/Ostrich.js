function drawOstrichBase(shadow) {
  mvPushMatrix();
  //item specific modifications
  mat4.scale(mvMatrix, [2, 2, 3]);
  //draw
  setupToDrawCube(shadow);
  setMatrixUniforms(shadow);
  chooseTexture(3, shadow);
  setupMaterial(armMaterial, shadow);
  gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  mvPopMatrix(shadow);
}

function drawOstrichWing(shadow) {
  mvPushMatrix();
  //item specific modifications
  mat4.scale(mvMatrix, [0.4, 2.5, 2.5]);
  //draw
  setupToDrawCube(shadow);
  setMatrixUniforms(shadow);
  chooseTexture(3, shadow);
  gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  mvPopMatrix(shadow);
}

function drawOstrichHead(shadow) {
  mvPushMatrix();
  //item specific modifications
  mat4.scale(mvMatrix, [0.5, 3.5, 0.5]);
  //draw
  setupToDrawCube(shadow);
  setMatrixUniforms(shadow);
  chooseTexture(11, shadow);
  gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  mvPopMatrix(shadow);
}

function drawOstrichLip(shadow) {
  mvPushMatrix();
  //item specific modifications
  mat4.scale(mvMatrix, [0.4, 0.2, 0.8]);
  //draw
  setupToDrawCube(shadow);
  setMatrixUniforms(shadow);
  chooseTexture(12, shadow);
  gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  mvPopMatrix(shadow);
}

function drawOstrichLeg(shadow) {
  mvPushMatrix();
  //item specific modifications
  mat4.scale(mvMatrix, [0.3, 3, 0.3]);
  //draw
  setupToDrawCube(shadow);
  setMatrixUniforms(shadow);
  chooseTexture(11, shadow);
  gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  mvPopMatrix(shadow);
}

function drawOstrichFoot(shadow) {
  mvPushMatrix();
  //item specific modifications
  mat4.scale(mvMatrix, [1, 0.1, 0.4]);
  //draw
  setupToDrawCube(shadow);
  setMatrixUniforms(shadow);
  chooseTexture(11, shadow);
  gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  mvPopMatrix(shadow);
}

function initOstrichTree() {
  // DUCK
  ostrichBaseNode = { draw: drawOstrichBase, matrix: mat4.identity(mat4.create()) };
  mat4.translate(ostrichBaseNode.matrix, [-10, -2.0, -4.0]);
  mat4.rotate(ostrichBaseNode.matrix, ostrichBaseAngle, [0.0, 1.0, 0.0]);

  ostrichHeadNode = { draw: drawOstrichHead, matrix: mat4.identity(mat4.create()) };
  mat4.translate(ostrichHeadNode.matrix, [0.0, 4.5, 1.75]);
  mat4.rotate(ostrichHeadNode.matrix, ostrichHeadAngle, [.1, .0, 0.0]);

  ostrichTopLipNode = { draw: drawOstrichLip, matrix: mat4.identity(mat4.create()) };
  mat4.translate(ostrichTopLipNode.matrix, [0.0, 1.75, 0.75]);
  mat4.rotate(ostrichTopLipNode.matrix, ostrichTopLipAngle, [1.0, .0, .0]);

  ostrichBottomLipNode = { draw: drawOstrichLip, matrix: mat4.identity(mat4.create()) };
  mat4.translate(ostrichBottomLipNode.matrix, [0.0, 1.4, 0.75]);
  mat4.rotate(ostrichBottomLipNode.matrix, ostrichBottomLipAngle, [1.0, .0, .0]);

  ostrichFirstWingNode = { draw: drawOstrichWing, matrix: mat4.identity(mat4.create()) };
  mat4.translate(ostrichFirstWingNode.matrix, [2.7, -0.5, 0.0]);
  mat4.rotate(ostrichFirstWingNode.matrix, ostrichWingAngle, [0.0, 0.0, 1.0]);

  ostrichSecondWingNode = { draw: drawOstrichWing, matrix: mat4.identity(mat4.create()) };
  mat4.translate(ostrichSecondWingNode.matrix, [-2.7, -0.5, 0.0]);
  mat4.rotate(ostrichSecondWingNode.matrix, -ostrichWingAngle, [0.0, 0.0, 1.0]);

  ostrichFirstLegNode = { draw: drawOstrichLeg, matrix: mat4.identity(mat4.create()) };
  mat4.translate(ostrichFirstLegNode.matrix, [-0.9, -2.75, 0.0]);

  ostrichSecondLegNode = { draw: drawOstrichLeg, matrix: mat4.identity(mat4.create()) };
  mat4.translate(ostrichSecondLegNode.matrix, [0.5, -2.75, 0.0]);

  ostrichFirstFootNode = { draw: drawOstrichFoot, matrix: mat4.identity(mat4.create()) };
  mat4.translate(ostrichFirstFootNode.matrix, [0.0, -2.75, 0.2]);

  ostrichSecondFootNode = { draw: drawOstrichFoot, matrix: mat4.identity(mat4.create()) };
  mat4.translate(ostrichSecondFootNode.matrix, [0.0, -2.75, 0.2]);
}
