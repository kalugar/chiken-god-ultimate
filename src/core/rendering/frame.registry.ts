import { Assets, Spritesheet, TextureSource } from 'pixi.js';

export interface BakedFrame {
    u: number; v: number; w: number; h: number;
    pixelWidth: number; pixelHeight: number;
}

export class FrameRegistry {
    private frames: Map<string, BakedFrame> = new Map();
    public atlasTexture: TextureSource | null = null;

    public async loadAtlas(jsonUrl: string): Promise<void> {
        // PixiJS скачает JSON и связанный с ним PNG
        const sheet = await Assets.load<Spritesheet>(jsonUrl);
        this.atlasTexture = sheet.textureSource;

        const atlasW = this.atlasTexture.width;
        const atlasH = this.atlasTexture.height;

        // Предрасчет UV-координат для видеокарты
        for (const [name, texture] of Object.entries(sheet.textures)) {
            const frame = texture.frame; 
            this.frames.set(name, {
                u: frame.x / atlasW,
                v: frame.y / atlasH,
                w: frame.width / atlasW,
                h: frame.height / atlasH,
                pixelWidth: frame.width,
                pixelHeight: frame.height
            });
        }
    }

    public getFrame(name: string): BakedFrame {
        const frame = this.frames.get(name);
        if (!frame) throw new Error(`Frame ${name} не найден в атласе!`);
        return frame;
    }
}