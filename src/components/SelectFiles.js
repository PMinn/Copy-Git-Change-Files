import { useSystem } from '@/contexts/System.js';
import { useEffect, useState } from "react";
import {
    Tabs,
    Tab,
    Chip,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Tooltip,
    Button,
    Spinner,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure
} from "@nextui-org/react";

export default function SelectFiles({ changes }) {
    const { projectId } = useSystem();
    const [selectedFileKeys, setSelectedFileKeys] = useState(new Set([]));
    const [buttons, setButtons] = useState(null);
    const [content, setContent] = useState(null);
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

    useEffect(() => {
        setSelectedFileKeys(new Set(changes.map((change, index) => { change.index = index; return change; }).filter(change => !change.status.includes('D')).map(change => 'fs_' + change.index)))
    }, [changes])

    function copy() {
        const checkedFiles = [...selectedFileKeys].map(key => changes[parseInt(key.substring(3))]);
        fetch('/api/copy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                checkedFiles,
                projectId
            })
        })
            .then(res => res.json())
            .then(data => {
                setContent("成功，檔案：" + data.filename);
                setButtons(<>
                    <Button color="default" onPress={() => {
                        fetch('/api/files/openTemp');
                    }}>開啟暫存區</Button>
                    <Button color="primary" onPress={() => {
                        const a = document.createElement('a');
                        a.href = `/temp/${data.filename}`;
                        a.download = `${data.filename}`;
                        a.style.display = 'none';
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                    }}>另存為</Button>
                </>);
                onOpen();
            })
            .catch(() => {
                setContent("失敗");
                setButtons(<Button color="default" onPress={onClose}>關閉</Button>);
                onOpen();
            });
    }

    return (
        <>
            <Table
                color="default"
                selectionMode="multiple"
                selectedKeys={selectedFileKeys}
                onSelectionChange={setSelectedFileKeys}
                isHeaderSticky
                classNames={{
                    base: "h-[80vh] overflow-auto",
                    table: "h-full",
                }}
            >
                <TableHeader>
                    <TableColumn>狀態</TableColumn>
                    <TableColumn>路徑</TableColumn>
                </TableHeader>
                <TableBody>
                    {changes.map((change, index) => (
                        <TableRow key={'fs_' + index}>
                            <TableCell>
                                <Chip color="default">{change.status}</Chip>
                            </TableCell>
                            <TableCell>{change.file}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {
                [...selectedFileKeys].length > 0 &&
                <div className="flex w-full justify-center my-2" >
                    <Button color='primary' onClick={copy}>開始複製</Button>
                </div>
            }
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={false}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">結果</ModalHeader>
                            <ModalBody>
                                {content}
                            </ModalBody>
                            <ModalFooter>
                                {buttons}
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}