function drawGiraffeBase(shadow) {
    mvPushMatrix();
    //item specific modifications
    mat4.scale(mvMatrix, [0.5, 3.5, 0.5]);
    //draw
    setupToDrawCube(shadow);
    setMatrixUniforms(shadow);
    chooseTexture(0, shadow);
    setupMaterial(cameraMaterial, shadow);
    gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix(shadow);
}

function drawGiraffeEars(shadow) {
    mvPushMatrix();
    //item specific modifications
    mat4.scale(mvMatrix, [0.35, 0.35, 0.1]);
    //draw
    setupToDrawCube(shadow);
    setMatrixUniforms(shadow);
    chooseTexture(0, shadow);
    gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix(shadow);
}

function drawGiraffeBody(shadow) {
    mvPushMatrix();
    //item specific modifications
    mat4.scale(mvMatrix, [1.8, 1.5, 3.3]);
    //draw
    setupToDrawCube(shadow);
    setMatrixUniforms(shadow);
    chooseTexture(0, shadow);
    gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix(shadow);
}

function drawGiraffeLegs(shadow) {
    mvPushMatrix();
    //item specific modifications
    mat4.scale(mvMatrix, [0.35, 2, 0.35]);
    //draw
    setupToDrawCube(shadow);
    setMatrixUniforms(shadow);
    chooseTexture(0, shadow);
    gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix(shadow);
}

function drawGiraffeCone(shadow) {
    mvPushMatrix();
    //item specific modifications
    mat4.scale(mvMatrix, [0.1, 0.5, 0.1]);
    //draw
    setupToDrawCube(shadow);
    setMatrixUniforms(shadow);
    chooseTexture(0, shadow);
    gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix(shadow);
}

function drawGiraffeBeak(shadow) {
    mvPushMatrix();
    //item specific modifications
    mat4.scale(mvMatrix, [.3, 0.4, 0.7]);
    //draw
    setupToDrawCube(shadow);
    setMatrixUniforms(shadow);
    chooseTexture(6, shadow);
    gl.drawElements(drawType, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix(shadow);
}

function initGiraffeTree() {
    baseGiraffeNode = { "draw": drawGiraffeBase, "matrix": mat4.identity(mat4.create()), "location": [5.0, 0.0, 0.0], "rotation": baseGiraffeAngle };
    mat4.translate(baseGiraffeNode.matrix, [9.0, 2, 0.0]);
    mat4.rotate(baseGiraffeNode.matrix, baseGiraffeAngle, [0.0, 1.5, 0.0]);

    firstGiraffeEarNode = { "draw": drawGiraffeEars, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(firstGiraffeEarNode.matrix, [0, 2.8, 0.3]);
    mat4.rotate(firstGiraffeEarNode.matrix, -giraffeEarAngle, [0.0, 0.0, 1.0]);
    mat4.translate(firstGiraffeEarNode.matrix, [0.5, 1.0, 0.0]);

    secondGiraffeEarNode = { "draw": drawGiraffeEars, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(secondGiraffeEarNode.matrix, [0, 2.8, 0.3]);
    mat4.rotate(secondGiraffeEarNode.matrix, giraffeEarAngle, [0.0, 0.0, 1.0]);
    mat4.translate(secondGiraffeEarNode.matrix, [-0.5, 1.0, 0.0]);

    giraffeBodyNode = { "draw": drawGiraffeBody, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(giraffeBodyNode.matrix, [0.0, -4.75, -3.5]);

    firstGiraffeLegNode = { "draw": drawGiraffeLegs, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(firstGiraffeLegNode.matrix, [-1.5, -3.5, 3.0]);

    secondGiraffeLegNode = { "draw": drawGiraffeLegs, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(secondGiraffeLegNode.matrix, [3, 0.0, 0.0]);

    thirdGiraffeLegNode = { "draw": drawGiraffeLegs, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(thirdGiraffeLegNode.matrix, [0.0, 0.0, -6]); //0.2

    fourthGiraffeLegNode = { "draw": drawGiraffeLegs, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(fourthGiraffeLegNode.matrix, [-3, 0.0, 0.0]); //0.2

    giraffeBeakNode = { "draw": drawGiraffeBeak, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(giraffeBeakNode.matrix, [0.0, 7.25, 4.]);

    giraffeTailNodeFirst = { "draw": drawGiraffeCone, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(giraffeTailNodeFirst.matrix, [.3, 8.75, 3.1]);

    giraffeTailNodeSecond = { "draw": drawGiraffeCone, "matrix": mat4.identity(mat4.create()) };
    mat4.translate(giraffeTailNodeSecond.matrix, [-.3, 8.75, 3.1]);
}