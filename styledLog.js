const colorMap = {
    black: '30',
    red: '31',
    green: '32',
    yellow: '33',
    blue: '34',
    magenta: '35',
    cyan: '36',
    white: '37',
};

export const log = (segments) => {
    let output = '';

    segments.forEach(({ message, styles = {} }) => {
        let styleCodes = [];

        if (styles.bold) styleCodes.push('1');
        if (styles.underlined) styleCodes.push('4');

        if (styles.color && colorMap[styles.color.toLowerCase()]) {
            styleCodes.push(colorMap[styles.color.toLowerCase()]);
        }

        const styleCode = styleCodes.length > 0 ? `\x1b[${styleCodes.join(';')}m` : '';
        const resetCode = '\x1b[0m';

        output += `${styleCode}${message}${resetCode}`;
    });

    console.log(output);
};

export const boldLog = (message, styles = {}) => log([{ message, styles: { ...styles, bold: true } }]);
export const underlinedLog = (message, styles = {}) => log([{ message, styles: { ...styles, underlined: true } }]);
export const boldUnderlinedLog = (message, styles = {}) => log([{ message, styles: { ...styles, bold: true, underlined: true } }]);
export const dangerLog = (message, styles = {}) => log([{ message, styles: { ...styles, bold: true, color: 'red' } }]);
export const warnLog = (message, styles = {}) => log([{ message, styles: { ...styles, bold: true, color: 'yellow' } }]);
export const successLog = (message, styles = {}) => log([{ message, styles: { ...styles, bold: true, color: 'green' } }]);
export const infoLog = (message, styles = {}) => log([{ message, styles: { ...styles, bold: true, color: 'blue' } }]);