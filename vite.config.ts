import { AssetPack, type AssetPackConfig } from '@assetpack/core'
import { cacheBuster } from '@assetpack/core/cache-buster'
import { ffmpeg } from '@assetpack/core/ffmpeg'
import { compress } from '@assetpack/core/image'
import { pixiManifest } from '@assetpack/core/manifest'
import { spineAtlasCacheBuster } from '@assetpack/core/spine'
// 1. Плагины генерации файлов (ТЕПЕРЬ ИЗ CORE)
import { texturePacker, texturePackerCacheBuster } from '@assetpack/core/texture-packer'
import { webfont } from '@assetpack/core/webfont'
import { defineConfig, type Plugin, type ResolvedConfig } from 'vite'
import glsl from 'vite-plugin-glsl'

function assetpackPlugin(isBuild: boolean): Plugin {
  const apConfig: AssetPackConfig = {
    entry: './raw-assets',
    output: './public/assets/',
    cache: true,
    pipes: [
      webfont(),
      ffmpeg({
        inputs: ['.mp3', '.ogg', '.wav'],
        outputs: [
          {
            formats: ['.webm'],
            recompress: false,
            options: {
              audioBitrate: 96,
              audioChannels: 1,
              audioFrequency: 48_000
            }
          },
          {
            formats: ['.mp3'],
            recompress: false,
            options: {
              audioBitrate: 96,
              audioChannels: 1,
              audioFrequency: 48_000
            }
          },
          {
            formats: ['.ogg'],
            recompress: false,
            options: {
              audioBitrate: 32,
              audioChannels: 1,
              audioFrequency: 22_050
            }
          }
        ]
      }),

      texturePacker({
        texturePacker: {
          padding: 2,
          removeFileExtension: false
        }
      }),

      compress({
        jpg: { quality: 90 },
        png: { quality: 90 },
        webp: { quality: 80, alphaQuality: 80 }
      }),
      ...(isBuild ? [cacheBuster(), texturePackerCacheBuster(), spineAtlasCacheBuster()] : []),
      pixiManifest({
        output: './src/game/test/manifest.json',
        createShortcuts: true,
        trimExtensions: true
      })
    ]
  }

  let mode: ResolvedConfig['command']
  let ap: AssetPack | undefined

  return {
    name: 'vite-plugin-assetpack',

    configResolved(resolvedConfig) {
      mode = resolvedConfig.command
      if (!resolvedConfig.publicDir) return
      if (apConfig.output) return

      const publicDir = resolvedConfig.publicDir.replace(process.cwd(), '')
      apConfig.output = `.${publicDir}/assets/`
    },

    buildStart: async () => {
      if (mode === 'serve') {
        if (ap) return
        ap = new AssetPack(apConfig)
        void ap.watch()
        console.log('🎨 Assetpack: Запущен в режиме наблюдения')
      } else {
        await new AssetPack(apConfig).run()
        console.log('📦 Assetpack: Ассеты успешно собраны и захешированы')
      }
    },
    buildEnd: async () => {
      if (ap) {
        await ap.stop()
        ap = undefined
      }
    }
  }
}

export default defineConfig(({ command }) => {
  const isBuild = command === 'build'

  return {
    server: {
      port: 3000,
      strictPort: true,
      open: true,
      host: true,
      headers: {
        'Cache-Control': 'no-store',
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp'
      }
    },
    build: {
      target: 'esnext'
    },
    resolve: {
      tsconfigPaths: true
    },
    plugins: [assetpackPlugin(isBuild), glsl()]
  }
})
