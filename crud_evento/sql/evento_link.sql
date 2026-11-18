-- Para bancos já criados antes do campo "link" (link do evento informado pelo organizador).
USE viewritiba;

ALTER TABLE evento ADD COLUMN link VARCHAR(500) NULL AFTER local;
