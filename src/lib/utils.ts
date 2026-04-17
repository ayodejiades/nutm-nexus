import {
  DocumentTextIcon, VideoCameraIcon, LinkIcon, PhotoIcon, SpeakerWaveIcon,
  ArchiveBoxIcon, CodeBracketIcon, TableCellsIcon
} from '@heroicons/react/24/outline'; 

const fileIconMap: { [key: string]: React.ElementType } = {
  pdf: DocumentTextIcon, doc: DocumentTextIcon, docx: DocumentTextIcon, txt: DocumentTextIcon,
  ppt: DocumentTextIcon, pptx: DocumentTextIcon, rtf: DocumentTextIcon, md: DocumentTextIcon,
  xls: TableCellsIcon, xlsx: TableCellsIcon, csv: TableCellsIcon,
  jpg: PhotoIcon, jpeg: PhotoIcon, png: PhotoIcon, gif: PhotoIcon, svg: PhotoIcon, webp: PhotoIcon,
  mp4: VideoCameraIcon, mov: VideoCameraIcon, avi: VideoCameraIcon, wmv: VideoCameraIcon, mkv: VideoCameraIcon, webm: VideoCameraIcon,
  mp3: SpeakerWaveIcon, wav: SpeakerWaveIcon, ogg: SpeakerWaveIcon,
  zip: ArchiveBoxIcon, rar: ArchiveBoxIcon, '7z': ArchiveBoxIcon, tar: ArchiveBoxIcon, gz: ArchiveBoxIcon,
  js: CodeBracketIcon, jsx: CodeBracketIcon, ts: CodeBracketIcon, tsx: CodeBracketIcon, py: CodeBracketIcon,
  java: CodeBracketIcon, c: CodeBracketIcon, cpp: CodeBracketIcon, cs: CodeBracketIcon, html: CodeBracketIcon,
  css: CodeBracketIcon, json: CodeBracketIcon,
  url: LinkIcon,
};

export function getFileIcon(filename?: string): React.ElementType {
  if (!filename) return DocumentTextIcon;
  const extension = filename.split('.').pop()?.toLowerCase() ?? '';
  return fileIconMap[extension] || DocumentTextIcon;
}