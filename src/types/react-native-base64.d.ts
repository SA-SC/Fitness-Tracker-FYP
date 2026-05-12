declare module 'react-native-base64' {
    const base64: {
        decode: (str: string) => string;
        encode: (str: string) => string;
    };
    export default base64;
}
