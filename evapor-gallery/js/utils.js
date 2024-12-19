function getPositionX(e) {
    return e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
}

function addDragListeners(selector, callbacks) {
    const element = document.querySelector(selector);
    
    element.addEventListener('mousedown', (e) => {
        e.preventDefault();
        callbacks.onDragStart(getPositionX(e));
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    });

    element.addEventListener('touchstart', (e) => {
        callbacks.onDragStart(getPositionX(e));
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('touchend', onTouchEnd);
    });

    function onMouseMove(e) {
        e.preventDefault();
        callbacks.onDragMove(getPositionX(e));
    }

    function onMouseUp(e) {
        callbacks.onDragEnd();
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
    }

    function onTouchMove(e) {
        e.preventDefault();
        callbacks.onDragMove(getPositionX(e));
    }

    function onTouchEnd(e) {
        callbacks.onDragEnd();
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);
    }
} 