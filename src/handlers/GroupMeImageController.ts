export default class GroupMeImageController {
    public async getImage(url:string) {
        const imageData = await fetch(url);
        const image = imageData.blob();
        return URL.createObjectURL(await image);;
    }
}