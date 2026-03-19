/**
 * Глобальные константы размера одного инстанса в памяти.
 * 16 чисел Float32 = 64 байта = Идеальная кэш-линия!
 */
export const STRIDE_FLOATS = 16;
export const STRIDE_BYTES = 64;

/**
 * ИНДЕКСЫ (Смещения) внутри одного блока на 16 чисел.
 * Мы используем их, чтобы точно знать, в какой ячейке массива лежит конкретное значение.
 */

// --- БЛОК 1: Трансформация (Transform Component) ---
export const OFFSET_X        = 0;
export const OFFSET_Y        = 1;
export const OFFSET_SCALE_X  = 2;
export const OFFSET_SCALE_Y  = 3;
export const OFFSET_ROTATION = 4;
export const OFFSET_ANCHOR_X = 5;
export const OFFSET_ANCHOR_Y = 6;
export const OFFSET_SKEW_X   = 7;
export const OFFSET_SKEW_Y   = 8;

// --- БЛОК 2: Рендер (Render Component) ---
export const OFFSET_UV_U     = 9;  // X координата в атласе
export const OFFSET_UV_V     = 10; // Y координата в атласе
export const OFFSET_UV_W     = 11; // Ширина кадра в атласе
export const OFFSET_UV_H     = 12; // Высота кадра в атласе
export const OFFSET_ORIG_W   = 13; // Базовая ширина в пикселях
export const OFFSET_ORIG_H   = 14; // Базовая высота в пикселях

// 15-й слот УНИКАЛЕН! В нем лежит упакованный Цвет + Альфа (Uint32).
export const OFFSET_COLOR_32 = 15; 

// --- БЛОК 3: Физика (Velocity Component) ---
// Внимание, инженерный трюк! У нас кончились слоты в 64-байтном блоке.
// Если нам нужна сложная физика, мы НЕ расширяем этот буфер (иначе убьем кэш рендера).
// Мы создадим ВТОРОЙ параллельный массив специально для физики.
export const PHYSICS_STRIDE_FLOATS = 4; // x, y, angularVelocity, mass
export const OFFSET_VEL_X = 0;
export const OFFSET_VEL_Y = 1;
export const OFFSET_ANG_VEL = 2;
export const OFFSET_MASS = 3;