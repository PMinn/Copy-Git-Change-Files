import { useSystem } from '@/contexts/System.js';
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Button,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
    Select,
    SelectItem,
    useDisclosure,
} from "@nextui-org/react";
import { useEffect, useState } from 'react';

export default function Layout({ children }) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { projectId, setProjectId } = useSystem();
    const [projects, setProjects] = useState([]);
    const [projectName, setProjectName] = useState("");
    const [projectPath, setProjectPath] = useState("");

    useEffect(() => {
        fetch('/api/project/list')
            .then(res => res.json())
            .then(data => {
                setProjects(data.projects);
                const ids = Object.keys(data.projects);
                if (ids.length > 0) {
                    setProjectId(ids[0]);
                    fetch(`/api/git/setEncode?projectId=${ids[0]}`);
                }
            })
    }, [])

    function addProject() {
        fetch('/api/project/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: projectName,
                path: projectPath
            })
        })
            .then(res => res.json())
            .then(data => {
                setProjects(data.projects);
                setProjectId(data.id);
                fetch(`/api/git/setEncode?projectId=${data.id}`);
            })
    }

    return (
        <>
            <div className='w-full h-svh flex flex-col'>
                <div className="w-full bg-gray-100 border-b border-gray-400">
                    <Dropdown>
                        <DropdownTrigger>
                            <Button variant="light" radius='none'>檔案</Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                            <DropdownItem key="new" onPress={onOpen}>新增專案</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
                <div className="flex h-full overflow-auto">
                    <div className='w-[250px] border-r border-gray-400'>
                        <Select
                            label="當前專案"
                            className='w-full border-b border-gray-400 bg-gray-300'
                            radius='none'
                            selectedKeys={[projectId]}
                            onChange={e => {
                                if (e.target.value) setProjectId(e.target.value)
                            }}
                        >
                            {Object.keys(projects).map(id => (
                                <SelectItem key={id}>
                                    {projects[id].name}
                                </SelectItem>
                            ))}
                        </Select>
                    </div>

                    <div className="grow max-h-full px-20">{children}</div>
                </div>
            </div>

            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="xl">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">新增專案</ModalHeader>
                            <ModalBody>
                                <Input type="text" variant="underlined" label="名稱" value={projectName} onInput={e => setProjectName(e.target.value)} />
                                <Input type="text" variant="underlined" label="專案路徑" value={projectPath} onInput={e => setProjectPath(e.target.value)} />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="default" onPress={onClose}>取消</Button>
                                <Button color="primary" onPress={() => {
                                    addProject();
                                    onClose();
                                }}>新增</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}