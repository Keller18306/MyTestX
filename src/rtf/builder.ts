export function textToRtf(text: string) {
    let value = '';

    value += '{\\rtf1\\ansi\\ansicpg1251\\deff0{\\fonttbl{\\f0\\fnil\\fcharset204{\\*\\fname Times New Roman;}Times New Roman CYR;}}\n';
    value += '{\\colortbl ;\\red0\\green0\\blue0;}\n';
    value += '\\viewkind4\\uc1\\pard\\cf1\\lang1049\\f0\\fs24 ';

    for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i)

        value += `\\u${char}?`;
    }

    value += '\\par\n';
    value += '}';

    return value;
}