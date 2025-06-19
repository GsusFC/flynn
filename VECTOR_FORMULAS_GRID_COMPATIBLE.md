# 🎯 Grid-Compatible Vector Formulas

## 📐 **COMPATIBILITY CRITERIA**
- ✅ Function that takes coordinates (x,y) and returns angle
- ✅ Pattern visible with straight vectors
- ✅ Direct implementation without trajectories
- ✅ Control via simple parameters

---

## 🌊 **1. WAVE PATTERNS**

### **Crossed Waves** ⭐⭐⭐
```javascript
angle = sin(x * frequency1) + cos(y * frequency2) + time * speed
```
- **Effect**: Rectangular interference pattern
- **Parameters**: frequency1, frequency2, speed
- **Visualization**: Grid of crossing waves

### **Radial Waves** ⭐⭐⭐
```javascript
distance = sqrt(x² + y²)
angle = sin(distance * frequency - time * speed) * amplitude
```
- **Effect**: Concentric waves from center
- **Parameters**: frequency, speed, amplitude
- **Visualization**: Like waves in a pond

### **Diagonal Waves** ⭐⭐
```javascript
angle = sin((x + y) * frequency - time * speed) * amplitude
```
- **Effect**: Waves traveling diagonally
- **Parameters**: frequency, speed, amplitude
- **Visualization**: Diagonal wave fronts

---

## ⚡ **2. ELECTROMAGNETIC PATTERNS**

### **Simple Dipole Field** ⭐⭐⭐
```javascript
// Two opposite charges
d1 = sqrt((x-x1)² + (y-y1)²)
d2 = sqrt((x-x2)² + (y-y2)²)
angle = atan2((y-y1)/d1³ - (y-y2)/d2³, (x-x1)/d1³ - (x-x2)/d2³)
```
- **Effect**: Electric dipole field
- **Parameters**: positions x1,y1, x2,y2
- **Visualization**: Classic field lines

### **Quadrupole Field** ⭐⭐
```javascript
// Four alternating charges
angle = sum of contributions from 4 charges
```
- **Effect**: 4-lobe pattern
- **Parameters**: positions, intensities
- **Visualization**: Quadruple symmetry

### **Helical Field** ⭐⭐⭐
```javascript
radius = sqrt(x² + y²)
angle = atan2(y, x) + z_helix * pitch + time * rotation_speed
```
- **Effect**: Expanding spiral
- **Parameters**: pitch, rotation_speed
- **Visualization**: DNA unwinding

---

## 🌀 **3. VORTICES AND SWIRLS**

### **Multiple Vortex** ⭐⭐⭐
```javascript
angle = 0
for(vortex in vortices) {
  dx = x - vortex.x
  dy = y - vortex.y
  angle += vortex.strength * atan2(dx, -dy) // perpendicular
}
```
- **Effect**: Multiple interacting swirls
- **Parameters**: positions, strengths
- **Visualization**: Influencing whirlpools

### **Drifting Vortex** ⭐⭐
```javascript
// Moving vortex
vortex_x = center_x + drift_x * time
vortex_y = center_y + drift_y * time
angle = atan2(y - vortex_y, x - vortex_x) + π/2
```
- **Effect**: Traveling swirl
- **Parameters**: drift_x, drift_y, velocity
- **Visualization**: Moving hurricane

### **Double Vortex** ⭐⭐⭐
```javascript
// Two vortices orbiting each other
angle1 = atan2(y-y1, x-x1) + π/2
angle2 = atan2(y-y2, x-x2) - π/2  // opposite
angle = (angle1 + angle2) / 2
```
- **Effect**: Vortex pair
- **Parameters**: separation, velocities
- **Visualization**: Twin whirlpools

---

## 📊 **4. PURE MATHEMATICAL FUNCTIONS**

### **Gaussian Gradient** ⭐⭐⭐
```javascript
// Field derived from gaussian function
gaussian = exp(-((x-cx)² + (y-cy)²) / (2*σ²))
// Gradient points towards/away from peak
angle = atan2(2*(y-cy)*gaussian, 2*(x-cx)*gaussian)
```
- **Effect**: Vector mountain
- **Parameters**: center cx,cy, width σ
- **Visualization**: Force hill

### **Saddle Point** ⭐⭐
```javascript
// Function f = x² - y²
angle = atan2(-2*y, 2*x)
```
- **Effect**: Hyperbolic saddle point
- **Parameters**: scales, rotation
- **Visualization**: Hyperbolic flow

### **Trigonometric Rosette** ⭐⭐⭐
```javascript
// Combine multiple frequencies
angle = a*sin(n1*atan2(y,x)) + b*cos(n2*atan2(y,x)) + time*speed
```
- **Effect**: Petal patterns
- **Parameters**: n1, n2, a, b, speed
- **Visualization**: Mathematical flowers

---

## 🎲 **5. COMBINED FIELDS**

### **Sum of Sines** ⭐⭐⭐
```javascript
angle = sin(x*f1 + t*s1) + sin(y*f2 + t*s2) + sin((x+y)*f3 + t*s3)
```
- **Effect**: Complex interference
- **Parameters**: 3 frequencies, 3 velocities
- **Visualization**: Dynamic moire patterns

### **Wave Product** ⭐⭐
```javascript
angle = sin(x*fx)*cos(y*fy)*amplitude + time*rotation
```
- **Effect**: Cross modulation
- **Parameters**: fx, fy, amplitude, rotation
- **Visualization**: Modulated grid

### **Logarithmic Spiral Field** ⭐⭐⭐
```javascript
r = sqrt(x² + y²)
theta = atan2(y, x)
angle = theta + a*log(r + 1) + time*speed
```
- **Effect**: Expanding spiral
- **Parameters**: a (curvature), speed
- **Visualization**: Rotating galaxy

---

## 🔥 **6. DYNAMIC FIELDS**

### **Breathing** ⭐⭐⭐
```javascript
// Pulsing field
pulse = sin(time * frequency)
r = sqrt(x² + y²)
angle = atan2(y, x) + pulse * sin(r * spatial_freq)
```
- **Effect**: Breathing field
- **Parameters**: frequency, spatial_freq
- **Visualization**: Organic pulsation

### **Heartbeat** ⭐⭐
```javascript
// Double pulse like heart
heartbeat = sin(time*f1) + 0.5*sin(time*f2 + π/4)
angle = base_angle + heartbeat * intensity
```
- **Effect**: Heart rhythm
- **Parameters**: f1, f2, intensity
- **Visualization**: Organic pulse

### **Traveling Wave** ⭐⭐⭐
```javascript
// Wave moving through field
wave_position = time * wave_speed
angle = sin((x - wave_position) * frequency) * amplitude
```
- **Effect**: Wave crossing screen
- **Parameters**: wave_speed, frequency, amplitude
- **Visualization**: Moving wave front

---

## 🎯 **TOP 5 RECOMMENDATIONS**

### **1. Crossed Waves** ⭐⭐⭐
**Reason**: Very visual, easy implementation, intuitive controls

### **2. Simple Dipole Field** ⭐⭐⭐
**Reason**: Real physics, recognizable pattern, educational

### **3. Multiple Vortex** ⭐⭐⭐
**Reason**: Dramatic, interactive, scalable

### **4. Gaussian Gradient** ⭐⭐⭐
**Reason**: Smooth, elegant, configurable

### **5. Sum of Sines** ⭐⭐⭐
**Reason**: Infinite variability, complex patterns

---

## 🔧 **IMPLEMENTATION TEMPLATE**

```javascript
function newVectorFieldAnimation(vectors, props, context) {
  const { param1, param2, param3 } = props;
  const { time, canvasWidth, canvasHeight } = context;
  
  return vectors.map(vector => {
    // Normalize coordinates if needed
    const x = vector.x / canvasWidth;  // [0, 1]
    const y = vector.y / canvasHeight; // [0, 1]
    
    // FORMULA HERE
    const angle = your_formula(x, y, time, param1, param2, param3);
    
    // Optionally modulate length
    const length = vector.length * length_modifier;
    
    return {
      ...vector,
      angle: angle,
      length: length
    };
  });
}
```

---

*All these formulas are designed to work directly with your straight vector grid system.*