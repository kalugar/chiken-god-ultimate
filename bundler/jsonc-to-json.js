import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'jsonc-parser'

const SRC_DIR = './src'
const DIST_DIR = './dist'

/**
 * Рекурсивная функция для поиска всех .jsonc файлов в папке и её подпапках
 * @param {string} directoryPath - Путь к папке
 * @param {string[]} arrayOfFiles - Массив для накопления путей
 * @returns {string[]}
 */
function getAllJsoncFiles(directoryPath, arrayOfFiles = []) {
  const files = fs.readdirSync(directoryPath)

  for (const file of files) {
    const fullPath = path.join(directoryPath, file)

    if (fs.statSync(fullPath).isDirectory()) {
      getAllJsoncFiles(fullPath, arrayOfFiles)
    } else if (fullPath.endsWith('.jsonc')) {
      arrayOfFiles.push(fullPath)
    }
  }
  return arrayOfFiles
}

console.log('🔄 Запуск сканирования и трансформации JSONC...')

try {
  if (!fs.existsSync(SRC_DIR)) {
    throw new Error(`Папка исходников ${SRC_DIR} не найдена.`)
  }

  const jsoncFiles = getAllJsoncFiles(SRC_DIR)

  if (jsoncFiles.length === 0) {
    console.log(`ℹ️ В папке ${SRC_DIR} не найдено файлов .jsonc.`)
    process.exit(0)
  }

  console.log(`📂 Найдено файлов: ${jsoncFiles.length}. Начинаем обработку...`)

  for (const filePath of jsoncFiles) {
    const relativePath = path.relative(SRC_DIR, filePath)

    const parsedPath = path.parse(relativePath)
    const targetFilename = path.join(parsedPath.dir, `${parsedPath.name}.json`)

    const destinationPath = path.join(DIST_DIR, targetFilename)

    fs.mkdirSync(path.dirname(destinationPath), { recursive: true })

    const rawData = fs.readFileSync(filePath, 'utf8')
    const parsedData = parse(rawData)
    const strictJson = JSON.stringify(parsedData, null, 2)

    fs.writeFileSync(destinationPath, strictJson, 'utf8')

    console.log(`✅ Трансформирован: src/${relativePath} -> dist/${targetFilename}`)
  }

  console.log('Operation completed')
} catch (error) {
  if (error instanceof Error) {
    console.error('❌ Ошибка сборки JSON:', error.message)
  } else {
    console.error('❌ Неизвестная ошибка сборки JSON:', error)
  }

  process.exit(1)
}
