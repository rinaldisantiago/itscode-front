# Sistema de Interacciones - ITSCode Frontend

## Descripción General

Se ha implementado un sistema completo de interacciones (like/dislike) para el wall de ITSCode que cumple con los siguientes requisitos:

1. **Toggle de interacciones**: Al hacer clic en like/dislike se crea la interacción, al volver a hacer clic en la misma reacción se elimina
2. **Exclusividad**: Solo se puede tener una reacción por post (like O dislike, no ambas)
3. **Feedback visual**: Los botones activos se muestran con estilos diferentes
4. **Prevención de múltiples clics**: Los botones se deshabilitan temporalmente durante las operaciones

## Archivos Modificados

### 1. `js/Views/wallViews.js`
- **Función `updateButtonState()`**: Actualiza el estado visual de los botones y contadores
- **Función `setupWallInteractions()`**: Maneja los eventos de clic en los botones de like/dislike
- **Lógica de toggle**: Detecta si existe una interacción y decide si crear o eliminar

### 2. `js/repository/interactionRepository.js`
- **Método `getUserInteraction()`**: Obtiene la interacción del usuario para un post específico
- **Método `createInteraction()`**: Crea una nueva interacción (like/dislike)
- **Método `deleteInteraction()`**: Elimina una interacción existente

### 3. `js/presentation/postPresentation.js`
- **HTML generado**: Incluye los atributos `data-interaction-id` necesarios para el toggle
- **Estado visual**: Aplica la clase `active` a los botones que tienen interacciones

### 4. `css/style.css`
- **Estilos `.action-btn.active`**: Botones activos con color destacado y escala aumentada
- **Estilos `.action-btn:disabled`**: Botones deshabilitados durante operaciones

## Flujo de Funcionamiento

### 1. Carga Inicial
```javascript
// El backend debe devolver posts con esta estructura:
{
  idPost: 123,
  likesCount: 5,
  dislikesCount: 2,
  userInteraction: {
    interactionId: 456,  // null si no hay interacción
    type: 1              // 1=LIKE, 2=DISLIKE, null si no hay
  }
}
```

### 2. Interacción del Usuario
```javascript
// Al hacer clic en un botón:
1. Se verifica si ya existe una interacción (data-interaction-id)
2. Si existe: se elimina la interacción
3. Si no existe: se crea una nueva interacción
4. Se actualiza el estado visual inmediatamente
```

### 3. Actualización de Estado
```javascript
// La función updateButtonState() maneja:
- Incrementar/decrementar contadores
- Activar/desactivar botones visualmente
- Resetear el botón opuesto si existe
- Actualizar los atributos data-interaction-id
```

## Endpoints del Backend Requeridos

### 1. Crear Interacción
```
POST /Interaction
Body: {
  "postId": number,
  "userId": number,
  "interactionType": number  // 1=LIKE, 2=DISLIKE
}
Response: {
  "interactionId": number
}
```

### 2. Eliminar Interacción
```
DELETE /Interaction
Body: {
  "interactionId": number
}
```

### 3. Obtener Posts con Interacciones
```
GET /Post?idUserLogger={userId}&pageNumber={page}&pageSize={size}&isMyPosts=false
Response: {
  "posts": [
    {
      "idPost": number,
      "likesCount": number,
      "dislikesCount": number,
      "userInteraction": {
        "interactionId": number | null,
        "type": number | null
      }
    }
  ]
}
```

## Características Implementadas

### ✅ Toggle de Interacciones
- Clic en like → crea like
- Clic en like nuevamente → elimina like
- Mismo comportamiento para dislike

### ✅ Exclusividad
- Si hay like y se hace clic en dislike → elimina like y crea dislike
- Si hay dislike y se hace clic en like → elimina dislike y crea like

### ✅ Feedback Visual
- Botones activos con color destacado (#00d0ff)
- Escala aumentada (scale(1.05))
- Transiciones suaves

### ✅ Prevención de Errores
- Botones deshabilitados durante operaciones (500ms)
- Manejo de errores con recarga automática
- Validación de respuestas del backend

## Consideraciones Técnicas

1. **ID de Usuario**: Actualmente hardcodeado como `LOGGED_USER_ID = 1`, debe obtenerse de la sesión
2. **Manejo de Errores**: Si falla una operación, se recarga la vista para mostrar el estado real
3. **Performance**: Las actualizaciones son inmediatas en el frontend, sin esperar confirmación del backend
4. **Compatibilidad**: Funciona con la arquitectura existente de capas (Repository, Presentation, Views)

## Próximos Pasos

1. Integrar con el sistema de autenticación para obtener el ID del usuario logueado
2. Implementar animaciones más sofisticadas para las transiciones
3. Agregar sonidos de feedback (opcional)
4. Implementar analytics de interacciones

