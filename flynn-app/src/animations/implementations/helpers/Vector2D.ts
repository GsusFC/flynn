export class Vector2D {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  clone() {
    return new Vector2D(this.x, this.y);
  }

  add(v: Vector2D) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  sub(v: Vector2D) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  mult(s: number) {
    this.x *= s;
    this.y *= s;
    return this;
  }

  div(s: number) {
    if (s !== 0) {
      this.x /= s;
      this.y /= s;
    }
    return this;
  }
  
  magSq() {
    return this.x * this.x + this.y * this.y;
  }

  mag() {
    return Math.sqrt(this.magSq());
  }
  
  distSq(v: Vector2D) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return dx * dx + dy * dy;
  }

  dot(v: Vector2D) {
    return this.x * v.x + this.y * v.y;
  }

  normalize() {
    const m = this.mag();
    if (m > 0) {
      this.div(m);
    }
    return this;
  }
  
  heading() {
      return Math.atan2(this.y, this.x);
  }

  setMag(m: number) {
    return this.normalize().mult(m);
  }

  limit(max: number) {
    const magSq = this.magSq();
    if (magSq > max * max) {
      this.div(Math.sqrt(magSq)).mult(max);
    }
    return this;
  }

  static sub(v1: Vector2D, v2: Vector2D): Vector2D {
    return new Vector2D(v1.x - v2.x, v1.y - v2.y);
  }
} 