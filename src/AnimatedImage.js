export class AnimatedImage {
    constructor(imgFile, size, length, delay) {
        const img = new Image();
        img.src = `./assets/spritesheets/${imgFile}`;

        this.image = img;
        this.size = size;
        this.length = length;
        this.delay = delay;
        this.index = 0;
        this.delta = 0;
        this.offset = 0;
    }

    updateAnimation(d) {
        while(d > this.delay) {
            d -= this.delay;
        }
        this.delta += d;
        if(this.delta > this.delay) {
            
            this.delta -= this.delay;
            this.index++;
            if(this.index >= this.length) {
                this.index = 0;
            }
            this.offset = this.index * this.size;
        }
    }
}