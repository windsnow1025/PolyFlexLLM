import FileLogic from "./FileLogic";

describe("FileLogic.getFilenameFromUrl", () => {
  it("returns the last path segment", () => {
    expect(FileLogic.getFilenameFromUrl("https://example.com/files/report.pdf"))
      .toBe("report.pdf");
  });
});
