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
} from "@nextui-org/react";

export default function SelectFiles({ changes }) {
    const { projectId } = useSystem();
    const [selectedFileKeys, setSelectedFileKeys] = useState(new Set([]));

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
                console.log(data);
            })
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
                    <Button color='primary'onClick={copy}>開始複製</Button>
                </div>
            }
        </>
    )
}