# 🎯 Fórmulas Vectoriales Compatibles con Grid

## 📐 **CRITERIOS DE COMPATIBILIDAD**
- ✅ Función que tome coordenadas (x,y) y devuelva ángulo
- ✅ Patrón visible con vectores rectos
- ✅ Implementación directa sin trayectorias
- ✅ Control por parámetros simples

---

## 🌊 **1. PATRONES ONDULATORIOS**

### **Ondas Cruzadas** ⭐⭐⭐
```javascript
angle = sin(x * frequency1) + cos(y * frequency2) + time * speed
```
- **Efecto**: Patrón de interferencia rectangular
- **Parámetros**: frequency1, frequency2, speed
- **Visualización**: Grid de ondas que se cruzan

### **Ondas Radiales** ⭐⭐⭐
```javascript
distance = sqrt(x² + y²)
angle = sin(distance * frequency - time * speed) * amplitude
```
- **Efecto**: Ondas concéntricas desde el centro
- **Parámetros**: frequency, speed, amplitude
- **Visualización**: Como ondas en estanque

### **Ondas Diagonales** ⭐⭐
```javascript
angle = sin((x + y) * frequency - time * speed) * amplitude
```
- **Efecto**: Ondas viajando diagonalmente
- **Parámetros**: frequency, speed, amplitude
- **Visualización**: Frentes de onda diagonales

---

## ⚡ **2. PATRONES ELECTROMAGNÉTICOS**

### **Campo Dipolo Simple** ⭐⭐⭐
```javascript
// Dos cargas opuestas
d1 = sqrt((x-x1)² + (y-y1)²)
d2 = sqrt((x-x2)² + (y-y2)²)
angle = atan2((y-y1)/d1³ - (y-y2)/d2³, (x-x1)/d1³ - (x-x2)/d2³)
```
- **Efecto**: Campo eléctrico dipolo
- **Parámetros**: posiciones x1,y1, x2,y2
- **Visualización**: Líneas de campo clásicas

### **Campo Cuadrupolo** ⭐⭐
```javascript
// Cuatro cargas alternadas
angle = suma de contribuciones de 4 cargas
```
- **Efecto**: Patrón de 4 lóbulos
- **Parámetros**: posiciones, intensidades
- **Visualización**: Simetría cuádruple

### **Campo Helicoidal** ⭐⭐⭐
```javascript
radius = sqrt(x² + y²)
angle = atan2(y, x) + z_helix * pitch + time * rotation_speed
```
- **Efecto**: Espiral en expansión
- **Parámetros**: pitch, rotation_speed
- **Visualización**: DNA desenrollándose

---

## 🌀 **3. VÓRTICES Y REMOLINOS**

### **Vórtice Múltiple** ⭐⭐⭐
```javascript
angle = 0
for(vortex in vortices) {
  dx = x - vortex.x
  dy = y - vortex.y
  angle += vortex.strength * atan2(dx, -dy) // perpendicular
}
```
- **Efecto**: Múltiples remolinos interactuando
- **Parámetros**: posiciones, fuerzas
- **Visualización**: Remolinos que se influencian

### **Vórtice con Deriva** ⭐⭐
```javascript
// Vórtice que se mueve
vortex_x = center_x + drift_x * time
vortex_y = center_y + drift_y * time
angle = atan2(y - vortex_y, x - vortex_x) + π/2
```
- **Efecto**: Remolino que viaja
- **Parámetros**: drift_x, drift_y, velocidad
- **Visualización**: Huracán en movimiento

### **Doble Vórtice** ⭐⭐⭐
```javascript
// Dos vórtices que orbitan entre sí
angle1 = atan2(y-y1, x-x1) + π/2
angle2 = atan2(y-y2, x-x2) - π/2  // opuesto
angle = (angle1 + angle2) / 2
```
- **Efecto**: Par de vórtices
- **Parámetros**: separación, velocidades
- **Visualización**: Torbellinos gemelos

---

## 📊 **4. FUNCIONES MATEMÁTICAS PURAS**

### **Gradiente de Gaussiana** ⭐⭐⭐
```javascript
// Campo derivado de función gaussiana
gaussian = exp(-((x-cx)² + (y-cy)²) / (2*σ²))
// Gradiente apunta hacia/desde el pico
angle = atan2(2*(y-cy)*gaussian, 2*(x-cx)*gaussian)
```
- **Efecto**: Montaña de vectores
- **Parámetros**: centro cx,cy, ancho σ
- **Visualización**: Colina de fuerza

### **Silla de Montar** ⭐⭐
```javascript
// Función f = x² - y²
angle = atan2(-2*y, 2*x)
```
- **Efecto**: Punto silla hiperbólico
- **Parámetros**: escalas, rotación
- **Visualización**: Flujo hiperbólico

### **Roseta Trigonométrica** ⭐⭐⭐
```javascript
// Combinar múltiples frecuencias
angle = a*sin(n1*atan2(y,x)) + b*cos(n2*atan2(y,x)) + time*speed
```
- **Efecto**: Patrones de pétalos
- **Parámetros**: n1, n2, a, b, speed
- **Visualización**: Flores matemáticas

---

## 🎲 **5. CAMPOS COMBINADOS**

### **Suma de Senos** ⭐⭐⭐
```javascript
angle = sin(x*f1 + t*s1) + sin(y*f2 + t*s2) + sin((x+y)*f3 + t*s3)
```
- **Efecto**: Interferencia compleja
- **Parámetros**: 3 frecuencias, 3 velocidades
- **Visualización**: Patrones de moire dinámicos

### **Producto de Ondas** ⭐⭐
```javascript
angle = sin(x*fx)*cos(y*fy)*amplitude + time*rotation
```
- **Efecto**: Modulación cruzada
- **Parámetros**: fx, fy, amplitude, rotation
- **Visualización**: Grid modulado

### **Campo Espiral Logarítmica** ⭐⭐⭐
```javascript
r = sqrt(x² + y²)
theta = atan2(y, x)
angle = theta + a*log(r + 1) + time*speed
```
- **Efecto**: Espiral que se expande
- **Parámetros**: a (curvatura), speed
- **Visualización**: Galaxy en rotación

---

## 🔥 **6. CAMPOS DINÁMICOS**

### **Respiración** ⭐⭐⭐
```javascript
// Campo que pulsa
pulse = sin(time * frequency)
r = sqrt(x² + y²)
angle = atan2(y, x) + pulse * sin(r * spatial_freq)
```
- **Efecto**: Campo que respira
- **Parámetros**: frequency, spatial_freq
- **Visualización**: Pulsación orgánica

### **Latido Cardíaco** ⭐⭐
```javascript
// Doble pulso como corazón
heartbeat = sin(time*f1) + 0.5*sin(time*f2 + π/4)
angle = base_angle + heartbeat * intensity
```
- **Efecto**: Ritmo de corazón
- **Parámetros**: f1, f2, intensity
- **Visualización**: Pulso orgánico

### **Onda Viajera** ⭐⭐⭐
```javascript
// Onda que se mueve por el campo
wave_position = time * wave_speed
angle = sin((x - wave_position) * frequency) * amplitude
```
- **Efecto**: Onda que cruza pantalla
- **Parámetros**: wave_speed, frequency, amplitude
- **Visualización**: Frente de onda móvil

---

## 🎯 **TOP 5 RECOMENDACIONES**

### **1. Ondas Cruzadas** ⭐⭐⭐
**Razón**: Muy visual, fácil implementación, controles intuitivos

### **2. Campo Dipolo Simple** ⭐⭐⭐
**Razón**: Física real, patrón reconocible, educativo

### **3. Vórtice Múltiple** ⭐⭐⭐
**Razón**: Dramático, interactivo, escalable

### **4. Gradiente de Gaussiana** ⭐⭐⭐
**Razón**: Suave, elegante, configurable

### **5. Suma de Senos** ⭐⭐⭐
**Razón**: Infinita variabilidad, patrones complejos

---

## 🔧 **PLANTILLA DE IMPLEMENTACIÓN**

```javascript
function newVectorFieldAnimation(vectors, props, context) {
  const { param1, param2, param3 } = props;
  const { time, canvasWidth, canvasHeight } = context;
  
  return vectors.map(vector => {
    // Normalizar coordenadas si es necesario
    const x = vector.x / canvasWidth;  // [0, 1]
    const y = vector.y / canvasHeight; // [0, 1]
    
    // FÓRMULA AQUÍ
    const angle = your_formula(x, y, time, param1, param2, param3);
    
    // Opcionalmente modular longitud
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

*Todas estas fórmulas están diseñadas para funcionar directamente con tu sistema de vectores rectos en grid.*