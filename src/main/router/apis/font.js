import { dialog } from 'electron'
import Fontmin from 'fontmin'
import path from 'path'
import fs from 'fs'
import fsPromise from 'fs/promises'
import { is } from '@electron-toolkit/utils'

export default class font {
    constructor(socket) {
        this.socket = socket
        this.on()
    }

    on() {
        this.socket.on('generateCompressedFile', this.generateCompressedFile.bind(this))
        this.socket.on('uploadFont', this.uploadFont.bind(this))
        this.socket.on('uploadTxt', this.uploadTxt.bind(this))
    }

    async uploadFont(pack) {
        const { fontFile } = pack
        const readFileData = await fsPromise.readFile(fontFile.path)

        const fontFolderPath = is.dev
            ? path.join(process.cwd(), `src/renderer/src/assets/fonts`)
            : path.join(__dirname, `../renderer/assets/fonts`)
        const ifFontFolderExist = fs.existsSync(fontFolderPath)

        if (!ifFontFolderExist) {
            await fsPromise.mkdir(fontFolderPath)
        }

        const writePath = path.join(fontFolderPath, fontFile.name)
        const backPath = is.dev ? `/src/assets/fonts/${fontFile.name}` : `./assets/fonts/${fontFile.name}`

        await fsPromise.writeFile(writePath, readFileData)
        this.socket.send('uploadFontBack', { data: { fontPath: backPath } }, pack)
    }

    async uploadTxt(pack) {
        const { txtFile } = pack
        const txtContent = await fsPromise.readFile(txtFile.path, { encoding: 'utf-8' })

        this.socket.send('uploadFontBack', { data: { content: txtContent } }, pack)
    }

    generateCompressedFile(pack) {
        const { fontName, fontPath, text } = pack

        dialog
            .showSaveDialog({
                defaultPath: fontName,
                filters: [{ name: 'Custom File Type', extensions: ['ttf', 'TTF', 'eot', 'woff', 'woff2', 'otf'] }]
            })
            .then((res) => {
                const { filePath: destPath, canceled } = res

                if (canceled) {
                    return
                }

                const fontmin = new Fontmin()
                    .src(fontPath)
                    .use(
                        Fontmin.glyph({
                            text,
                            hinting: false // keep ttf hint info (fpgm, prep, cvt). default = true
                        })
                    )
                    .dest(destPath)

                fontmin.run(async (err) => {
                    if (err) {
                        console.log('fontmin err', err, err.message)

                        if (err.message.includes('file already exists')) {
                            this.socket.send('generateCompressedFileBack', { status: 1001, data: { success: false } }, pack)
                        }
                        return
                    }

                    await fsPromise.writeFile(path.join(destPath, 'text.txt'), text, { encoding: 'utf-8' })
                    this.socket.send('generateCompressedFileBack', { data: { success: true } }, pack)
                })
            })
    }
}
