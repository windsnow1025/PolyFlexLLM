import AnnouncementClient from "./AnnouncementClient";
import {handleError} from "@/lib/common/ErrorHandler";
import {AnnouncementResDto} from "@/client/nest";

export default class AnnouncementLogic {
  private announcementClient: AnnouncementClient;

  constructor() {
    this.announcementClient = new AnnouncementClient();
  }

  async fetchAnnouncement(): Promise<AnnouncementResDto> {
    try {
      return await this.announcementClient.fetchAnnouncement();
    } catch (error) {
      handleError(error, "Failed to fetch announcement");
    }
  }

  async updateAnnouncement(content: string): Promise<AnnouncementResDto> {
    try {
      return await this.announcementClient.updateAnnouncement(content);
    } catch (error) {
      handleError(error, "Failed to update announcement");
    }
  }
}
