let currentAction = null;
let actionQueue = []

function processCurrentAction(delta) {
  if (!currentAction && actionQueue.length > 0) {
    currentAction = actionQueue.shift();
    currentAction.timer = 0;
    currentAction.stepIndex = 0;
  }

  if (!currentAction) return;

  if (currentAction.type === "move") {
    processMoveCommand(currentAction, delta);
  }
}



const STEP_DURATION = 150; // ms per tile

function processMoveCommand(action, delta) {
  action.timer += delta;

  if (action.timer >= STEP_DURATION) {
    action.timer -= STEP_DURATION;

    const next = action.path[action.stepIndex];
    action.unit.x = next.x;
    action.unit.y = next.y;
    action.stepIndex++;

    if (action.stepIndex >= action.path.length) {
      currentAction = null; // done
    }
  }
}
