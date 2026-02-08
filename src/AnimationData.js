export class AnimationData {
    constructor(arrayIndex, size = 64, length = 1, loop = true) {
        this.arrayIndex = arrayIndex;
        this.hue        = 0;
        this.direction  = 0;
        this.size       = size;
        this.length     = length;
        this.frameTime  = 200;
        this.index      = 0;
        this.delta      = 0;
        this.loop       = loop;
        this.x          = null;
        this.y          = null;
        this.kill       = false;
        this.hitFrame   = 0;
        this.drawSize   = 0;
    }

    updateAnimation(d) {
        let updated = false;
        this.delta += d;
        while(this.delta > this.frameTime) {
            updated = true;
            this.delta -= this.frameTime;
            this.index++;
            if(this.index >= this.length) {
                this.index = this.loop ? 0 : this.length - 1;
            }
        }
        return updated;
    }

    resetAnimation() {
        this.index  = 0;
        this.delta  = 0;
    }

    setXY(x, y) {
        this.x = x;
        this.y = y;
    }
}