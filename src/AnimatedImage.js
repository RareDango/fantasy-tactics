export class AnimatedImage {
    constructor(imgFile, size = 64, length = 1, loop = true) {
        const img = new Image();
        img.src = `./assets/spritesheets/${imgFile}`;

        this.image  = img;
        this.size   = size;
        this.length = length;
        this.frameTime  = 200;
        this.index  = 0;
        this.delta  = 0;
        this.offset = 0;
        this.loop   = loop;
        this.x      = null;
        this.y      = null;
        this.kill   - false;
    }

    updateAnimation(d) {
        this.delta += d;
        while(this.delta > this.frameTime) {
            this.delta -= this.frameTime;
            this.index++;
            if(this.index >= this.length) {
                this.index = this.loop ? 0 : this.length - 1;
            }
            this.offset = this.index * this.size;
        }
    }

    resetAnimation() {
        this.index  = 0;
        this.delta  = 0;
        this.offset = 0;
    }

    setXY(x, y) {
        this.x = x;
        this.y = y;
    }
}