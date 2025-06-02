# 🎨 Ideas de Animaciones de Vectores Avanzadas

## 📚 Fuentes de Inspiración
- Flow Fields (Keith Peters - Medium)
- Campos vectoriales de física (magnético, eléctrico)
- Matemáticas de curvas paramétricas
- Fractales y sistemas dinámicos

---

## 🌀 **1. CAMPOS FÍSICOS**

### **Dipolo Magnético**
```
Bx = μ₀m/(4π) * (3xy/r⁵)
By = μ₀m/(4π) * (3y²-r²)/r⁵
```
- **Descripción**: Simula el campo magnético de un dipolo
- **Parámetros**: Momento magnético, posición del dipolo
- **Efecto**: Vectores forman loops cerrados alrededor del dipolo

### **Campo Eléctrico Radial**
```
Ex = kQ * x/r³
Ey = kQ * y/r³
```
- **Descripción**: Campo eléctrico de carga puntual
- **Parámetros**: Carga Q, constante k
- **Efecto**: Vectores apuntan hacia/desde la carga

### **Tornados Duales**
```
angle = atan2(y-cy, x-cx) + t*ω + A*sin(r/λ)
```
- **Descripción**: Dos vórtices que interactúan
- **Parámetros**: Posiciones, velocidades angulares, amplitud
- **Efecto**: Patrones complejos de interferencia

---

## 📐 **2. CURVAS PARAMÉTRICAS COMO CAMPOS**

### **Rosa de Rhodonea** 
```
r = a*cos(k*θ)
angle = k*θ + phase_offset
```
- **Descripción**: Vectores siguen tangentes de rosas matemáticas
- **Parámetros**: k (número de pétalos), a (amplitud)
- **Efecto**: Patrones florales dinámicos

### **Espiral de Arquímedes**
```
r = a + b*θ
angle = θ + π/2 (tangente)
```
- **Descripción**: Vectores tangentes a espiral
- **Parámetros**: a (offset), b (separación)
- **Efecto**: Espiral infinita hacia fuera

### **Cardioide Dinámica**
```
x = a*(2*cos(t) - cos(2*t))
y = a*(2*sin(t) - sin(2*t))
angle = atan2(dy/dt, dx/dt)
```
- **Descripción**: Forma de corazón en movimiento
- **Parámetros**: a (tamaño), velocidad de t
- **Efecto**: Corazón pulsante

### **Mariposa de Lorenz**
```
x = sin(t)*(e^cos(t) - 2*cos(4*t) - sin^5(t/12))
y = cos(t)*(e^cos(t) - 2*cos(4*t) - sin^5(t/12))
```
- **Descripción**: Curva mariposa transcendental
- **Parámetros**: Velocidad, escalas
- **Efecto**: Alas de mariposa ondulantes

---

## 🔄 **3. SISTEMAS DINÁMICOS**

### **Atractor de Lorenz 2D**
```
dx/dt = σ(y - x)
dy/dt = x(ρ - z) - y  [proyectado a 2D]
```
- **Descripción**: Proyección 2D del famoso atractor caótico
- **Parámetros**: σ, ρ, β
- **Efecto**: Caos determinista

### **Péndulo Doble**
```
θ₁'' = [compleja ecuación diferencial]
θ₂'' = [compleja ecuación diferencial]
```
- **Descripción**: Campo vectorial del péndulo doble
- **Parámetros**: Masas, longitudes, gravedad
- **Efecto**: Movimiento caótico e impredecible

### **Mapa de Hénon**
```
x₍ₙ₊₁₎ = 1 - a*x²ₙ + yₙ
y₍ₙ₊₁₎ = b*xₙ
```
- **Descripción**: Sistema dinámico discreto
- **Parámetros**: a = 1.4, b = 0.3 (valores clásicos)
- **Efecto**: Atractor extraño fractal

---

## 🌊 **4. ONDAS COMPLEJAS**

### **Interferencia de Ondas**
```
z = A₁*sin(k₁·r - ω₁*t + φ₁) + A₂*sin(k₂·r - ω₂*t + φ₂)
angle = atan2(∂z/∂y, ∂z/∂x)
```
- **Descripción**: Múltiples fuentes de ondas interfieren
- **Parámetros**: Amplitudes, frecuencias, fases
- **Efecto**: Patrones de interferencia complejos

### **Ondas de Choque**
```
v = { v₁ si x < shock_position(t)
    { v₂ si x ≥ shock_position(t)
```
- **Descripción**: Discontinuidades que se propagan
- **Parámetros**: Velocidades antes/después, posición
- **Efecto**: Frentes de onda abruptos

### **Solitones**
```
u = A*sech²(√(A/12)*(x - A*t/3))
```
- **Descripción**: Ondas solitarias que mantienen forma
- **Parámetros**: Amplitud A
- **Efecto**: Pulsos que viajan sin deformarse

---

## 🎯 **5. CAMPOS GEOMÉTRICOS**

### **Teselación de Voronoi**
```
angle = perpendicular_to_nearest_edge
```
- **Descripción**: Vectores perpendiculares a bordes de Voronoi
- **Parámetros**: Puntos semilla, distancias
- **Efecto**: Celulas orgánicas

### **Fractales de Newton**
```
z₍ₙ₊₁₎ = zₙ - f(zₙ)/f'(zₙ)
```
- **Descripción**: Método de Newton en plano complejo
- **Parámetros**: Función f, punto inicial
- **Efecto**: Cuencas de atracción coloridas

### **Transformaciones Möbius**
```
w = (az + b)/(cz + d)
```
- **Descripción**: Transformaciones conformes
- **Parámetros**: a, b, c, d (números complejos)
- **Efecto**: Deformaciones que preservan ángulos

---

## ⚡ **6. CAMPOS ENERGÉTICOS**

### **Potencial de Lennard-Jones**
```
V = 4ε[(σ/r)¹² - (σ/r)⁶]
F = -∇V
```
- **Descripción**: Interacción molecular
- **Parámetros**: ε (profundidad), σ (distancia)
- **Efecto**: Atracción/repulsión molecular

### **Campo Gravitacional N-Cuerpos**
```
F = Σᵢ Gmᵢm/(|rᵢ-r|²) * (rᵢ-r)/|rᵢ-r|
```
- **Descripción**: Múltiples masas gravitacionales
- **Parámetros**: Masas, posiciones
- **Efecto**: Órbitas complejas, puntos de Lagrange

### **Plasma en Campo Magnético**
```
v⊥ = E×B/B²  (deriva E×B)
```
- **Descripción**: Partículas cargadas en campos cruzados
- **Parámetros**: E, B, carga
- **Efecto**: Derivas y ciclotrón

---

## 🎨 **7. ARTE GENERATIVO**

### **Autómatas Celulares Vectoriales**
```
if neighbors_count == 3: birth
if neighbors_count ∈ {2,3}: survive
angle = function_of_local_state
```
- **Descripción**: Conway's Life pero con vectores
- **Parámetros**: Reglas, estados
- **Efecto**: Evolución orgánica compleja

### **Campos de Gradiente**
```
angle = atan2(∂f/∂y, ∂f/∂x)
f = función_artística(x,y,t)
```
- **Descripción**: Gradiente de funciones artísticas
- **Parámetros**: Función base personalizada
- **Efecto**: Flujo siguiendo gradientes

### **Tiling Penrose Vectorial**
```
angle = local_penrose_orientation + noise
```
- **Descripción**: Vectores alineados con tiling aperiódico
- **Parámetros**: Escala de tiling, ruido
- **Efecto**: Patrones cuasi-cristalinos

---

## 🔧 **PARÁMETROS GLOBALES SUGERIDOS**

### **Factores Universales**
- **Velocidad global**: Multiplica todas las velocidades temporales
- **Intensidad global**: Multiplica todas las amplitudes
- **Escala espacial**: Factor de zoom del patrón
- **Fase temporal**: Offset de tiempo global
- **Mezcla de ruido**: % de ruido añadido a cualquier patrón

### **Efectos de Post-Procesamiento**
- **Suavizado temporal**: Promedio con frames anteriores
- **Cuantización angular**: Limitar a N direcciones discretas
- **Modulación de longitud**: Longitud = f(posición, tiempo)
- **Modo de color**: HSL basado en ángulo/velocidad

---

## 🎯 **PRÓXIMAS IMPLEMENTACIONES PRIORITARIAS**

1. **Rosa de Rhodonea** - Visualmente impresionante y matemáticamente elegante
2. **Dipolo Magnético** - Comportamiento físico real
3. **Interferencia de Ondas** - Patrones complejos pero predecibles
4. **Mariposa de Lorenz** - Curva icónica y hermosa
5. **Campo Gravitacional N-Cuerpos** - Simulación física realista

---

*Documento creado: $(date)*
*Fuentes: Medium, Wikipedia, Wolfram, investigación matemática*