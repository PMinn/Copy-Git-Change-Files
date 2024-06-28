import { useSystem } from '@/contexts/System.js';
import { useEffect, useState } from "react";
import SelectFiles from '@/components/SelectFiles';
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
import Head from 'next/head';

export default function Index() {
    const { projectId } = useSystem();
    const [oldProjectId, setOldProjectId] = useState(null);
    const [changes, setChanges] = useState([]);
    const [selectedFileKeys, setSelectedFileKeys] = useState(new Set([]));
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [commits, setCommits] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [startCommit, setStartCommit] = useState(null);
    const [endCommit, setEndCommit] = useState(null);
    const [isCommitsSelected, setIsCommitsSelected] = useState(false);
    const [changesByCommits, setChangesByCommits] = useState([]);

    useEffect(() => {
        if (projectId) {
            if (oldProjectId == null) setOldProjectId(projectId);
            else if (oldProjectId != projectId) {
                setOldProjectId(projectId);
                setStartCommit(null);
                setEndCommit(null);
                setPage(1);
                setIsLoading(true);
                setCommits([]);
                setChangesByCommits([]);
                setIsCommitsSelected(false);
            }
            fetch('/api/git/getChanges', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ projectId })
            })
                .then(res => res.json())
                .then(data => {
                    setChanges(data.files);
                    setSelectedFileKeys(new Set(data.files.map((change, index) => { change.index = index; return change; }).filter(change => !change.status.includes('D')).map(change => 'fs_' + change.index)));
                })
                .catch(() => {
                    alert('取得修改失敗');
                });

            loadMore([]);
        } else {
            setOldProjectId(projectId);
            setStartCommit(null);
            setEndCommit(null);
            setPage(1);
            setIsLoading(false);
            setCommits([]);
            setChangesByCommits([]);
            setIsCommitsSelected(false);
            setSelectedFileKeys(new Set())
        }
    }, [projectId])

    useEffect(() => {
        if (projectId) loadMore()
    }, [page])

    function loadMore() {
        fetch(`/api/git/getCommits?projectId=${projectId}&page=${page}`)
            .then(res => res.json())
            .then(data => {
                if (page == 1) setCommits(data.results);
                else setCommits([...commits, ...data.results]);
                setHasMore(data.next);
                setIsLoading(false);
            })
            .catch(() => {
                alert('取得提交失敗');
            });
    }

    function commitsSelected() {
        fetch('/api/git/getChangesByCommits', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ projectId, startCommit, endCommit })
        })
            .then(res => res.json())
            .then(data => {
                setChangesByCommits(data.files);
                setIsCommitsSelected(true);
            })
            .catch(() => {
                alert('取得修改失敗');
            });
    }

    return (
        <div className="w-full h-full flex flex-col">
            <Head>
                <title>CGCF</title>
            </Head>
            <Tabs color="primary" variant="underlined" fullWidth={true}>
                <Tab key="changes" title="修改">
                    <SelectFiles changes={changes} />
                </Tab>
                <Tab className='h-full' key="commits" title="提交">
                    {
                        isCommitsSelected ?
                            <>
                                <span className='text-lg cursor-pointer active:opacity-50 px-4 block' onClick={() => setIsCommitsSelected(false)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" fill="#000000" viewBox="0 0 256 256"><path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path></svg>
                                </span>
                                <SelectFiles changes={changesByCommits} />
                            </>
                            :
                            <>
                                <Table
                                    color="default"
                                    isHeaderSticky
                                    classNames={{
                                        base: "h-[80vh] overflow-auto",
                                        table: "h-full",
                                    }}
                                    bottomContent={
                                        hasMore && !isLoading ? (
                                            <div className="flex w-full justify-center">
                                                <Button variant="flat" onPress={() => setPage(p => p + 1)}>
                                                    {isLoading && <Spinner color="white" size="sm" />}
                                                    讀取更多
                                                </Button>
                                            </div>
                                        ) : null
                                    }
                                >
                                    <TableHeader>
                                        <TableColumn key="commit">提交</TableColumn>
                                        <TableColumn key="message">訊息</TableColumn>
                                        <TableColumn key="author">作者</TableColumn>
                                        <TableColumn key="action">設為</TableColumn>
                                    </TableHeader>
                                    <TableBody
                                        isLoading={isLoading}
                                        loadingContent={<Spinner label="Loading..." />}
                                    >
                                        {commits.map((commit, index) => (
                                            <TableRow key={commit.commit}>
                                                <TableCell>{commit.commit}</TableCell>
                                                <TableCell>{commit.message}</TableCell>
                                                <TableCell>{commit.author}</TableCell>
                                                <TableCell>
                                                    <div className="relative flex items-center gap-2">
                                                        <Tooltip content="初始(較低)">
                                                            <span onClick={() => setStartCommit(commit.commit)} className={"text-lg cursor-pointer active:opacity-50 " + (commit.commit == startCommit ? "text-orange-400" : "text-default-400")}>
                                                                {
                                                                    commit.commit == startCommit ?
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M128,16a88.1,88.1,0,0,0-88,88c0,75.3,80,132.17,83.41,134.55a8,8,0,0,0,9.18,0C136,236.17,216,179.3,216,104A88.1,88.1,0,0,0,128,16Zm0,56a32,32,0,1,1-32,32A32,32,0,0,1,128,72Z"></path></svg>
                                                                        :
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M128,64a40,40,0,1,0,40,40A40,40,0,0,0,128,64Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,128Zm0-112a88.1,88.1,0,0,0-88,88c0,31.4,14.51,64.68,42,96.25a254.19,254.19,0,0,0,41.45,38.3,8,8,0,0,0,9.18,0A254.19,254.19,0,0,0,174,200.25c27.45-31.57,42-64.85,42-96.25A88.1,88.1,0,0,0,128,16Zm0,206c-16.53-13-72-60.75-72-118a72,72,0,0,1,144,0C200,161.23,144.53,209,128,222Z"></path></svg>
                                                                }
                                                            </span>
                                                        </Tooltip>
                                                        <Tooltip content="最新(較高)">
                                                            <span onClick={() => setEndCommit(commit.commit)} className={"text-lg cursor-pointer active:opacity-50 " + (commit.commit == endCommit ? "text-orange-400" : "text-default-400")}>
                                                                {
                                                                    commit.commit == endCommit ?
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M232,56V176a8,8,0,0,1-2.76,6c-15.28,13.23-29.89,18-43.82,18-18.91,0-36.57-8.74-53-16.85C105.87,170,82.79,158.61,56,179.77V224a8,8,0,0,1-16,0V56a8,8,0,0,1,2.77-6h0c36-31.18,68.31-15.21,96.79-1.12C167,62.46,190.79,74.2,218.76,50A8,8,0,0,1,232,56Z"></path></svg>
                                                                        :
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M42.76,50A8,8,0,0,0,40,56V224a8,8,0,0,0,16,0V179.77c26.79-21.16,49.87-9.75,76.45,3.41,16.4,8.11,34.06,16.85,53,16.85,13.93,0,28.54-4.75,43.82-18a8,8,0,0,0,2.76-6V56A8,8,0,0,0,218.76,50c-28,24.23-51.72,12.49-79.21-1.12C111.07,34.76,78.78,18.79,42.76,50ZM216,172.25c-26.79,21.16-49.87,9.74-76.45-3.41-25-12.35-52.81-26.13-83.55-8.4V59.79c26.79-21.16,49.87-9.75,76.45,3.4,25,12.35,52.82,26.13,83.55,8.4Z"></path></svg>
                                                                }
                                                            </span>
                                                        </Tooltip>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {
                                    startCommit && endCommit &&
                                    <div className="flex w-full justify-center my-2">
                                        <Button color='primary' onClick={commitsSelected}>確認</Button>
                                    </div>
                                }
                            </>
                    }
                </Tab>

            </Tabs>
        </div>
    )
}