'use client';
import React, { use, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ExternalLink, Youtube, Video, PlusIcon } from "lucide-react";
import Link from "next/link";

import { createClient } from '@supabase/supabase-js';
import { DatePickerWithRange } from "@/components/custom/date-picker";
import LinkCard from "@/components/custom/link-card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

function App() {
  const [links, setLinks] = React.useState([]);
  const [selectedDate, setSelectedDate] = React.useState({
    from: null,
    to: null,
  });
  const [isLoading, setIsLoading] = React.useState(true); // For initial loading state
  const [isLoadingMore, setIsLoadingMore] = React.useState(false); // For pagination
  const [hasMore, setHasMore] = React.useState(true);
  const [offset, setOffset] = React.useState(0);

  const [url, setUrl] = React.useState("");

  const toIndonesiaDateString = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    };

    const parts = new Intl.DateTimeFormat('en-GB', options).format(date).split('/');
    const [day, month, year] = parts;

    return `${year}-${month}-${day}`;
  };

  const fetchData = async (query = "", offset = 0, append = false) => {
    const { from, to } = selectedDate;
    const limit = 20;

    // Set loading state
    if (append) setIsLoadingMore(true);
    else setIsLoading(true); // Set initial loading to true

    const toPlusOne = new Date(to);
    toPlusOne.setDate(toPlusOne.getDate() + 1);

    const fromDate = toIndonesiaDateString(from);
    const toDate = toIndonesiaDateString(toPlusOne);

    let sup = supabase
      .from('link')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (from && to) {
      sup = sup.gte('created_at', fromDate).lt('created_at', toDate);
    }

    if (query && query.length > 0) {
      sup = sup.ilike('link', `%${query}%`);
    }

    const { data, error } = await sup;

    if (error) {
      console.error('Error fetching data:', error);
    } else {
      if (append) {
        setLinks((prev) => [...prev, ...data]);
      } else {
        setLinks(data);
      }

      setHasMore(data.length === limit); // If less than limit, no more data

      if (!append) setIsLoading(false); // Set loading to false when initial data fetch is complete
    }

    if (append) setIsLoadingMore(false); // Set loading to false for pagination
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedDate.from && selectedDate.to) {
      fetchData();
    }
  }, [selectedDate]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const bottom = document.body.offsetHeight - 300;

      if (scrollPosition >= bottom && !isLoadingMore && hasMore) {
        const newOffset = offset + 20;
        setOffset(newOffset);
        fetchData("", newOffset, true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [offset, isLoadingMore, hasMore]);



  const handleDelete = async (id: number) => {
    await supabase.from("link").delete().eq("id", id);
    fetchData();
  };

  const handleAdd = async () => {

    if (!url) {
      toast.error("URL tidak boleh kosong");
      return;
    }
    if (!url.startsWith("https")) {
      toast.error("URL tidak valid");
      return;
    }
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_EDGE_URL}?url=${url}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    await response.json();

    setUrl("");

    toast.success("Link berhasil ditambahkan");

    fetchData();
  }

  return (
    <main className="py-8 px-8">
      <div className="mb-8 flex lg:flex-row flex-col items-center gap-x-4">
        <h1 className="text-2xl font-bold lg:mb-0 mb-3">Link Collection</h1>
        <DatePickerWithRange
          className="w-full lg:w-[300px] mb-3 lg:mb-0 lg:ml-auto"
          onSeletect={(date) => {
            setSelectedDate({
              from: date?.from || date?.to || null,
              to: date?.to || date?.from || null,
            });
          }}
        />
        <Input
          className="lg:w-[200px]"
          placeholder="Cari...."
          onChange={(item) => {
            if (item.target.value.length > 0) {
              fetchData(item.target.value);
            } else {
              fetchData();
            }
          }}
        />
        <Dialog>
          <DialogTrigger asChild>
            <Button size="icon" className="fixed lg:static right-4 bottom-4"> 
              <PlusIcon />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tambah Link</DialogTitle>
              <DialogDescription>
                Tambahkan link baru ke koleksi Anda. Pastikan untuk memasukkan URL yang valid.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <Input type="url" id="link" placeholder="Masukan Link" className="w-full" />
            </div>
            <DialogFooter>
              <Button onClick={handleAdd}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Initial loading or filter date or query loading skeleton */}
        {(isLoading ) ? (
          <>
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="h-full hover:shadow-md transition-shadow">
                <CardContent>
                  <Skeleton className="h-6 mb-3" />
                  <Skeleton className="h-6" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-4 w-24" />
                </CardFooter>
              </Card>
            ))}
          </>
        ) : (
          links.map((item) => (
            <LinkCard key={item.id+item.link} data={item} onDelete={(id) => handleDelete(id) } />
          ))
        )}

{(isLoadingMore ) ? (
          <>
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="h-full hover:shadow-md transition-shadow">
                <CardContent>
                  <Skeleton className="h-6 mb-3" />
                  <Skeleton className="h-6" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-4 w-24" />
                </CardFooter>
              </Card>
            ))}
          </>
        ) : null }
      </div>

      {/* Loading spinner for pagination */}
      {isLoadingMore && (
        <div className="text-center py-6 col-span-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading more...</p>
        </div>
      )}

      {/* No more data message */}
      {!hasMore && !isLoadingMore && (
        <div className="text-center py-6 col-span-full">
          <p className="text-sm text-gray-500 mt-2">No more data available</p>
        </div>
      )}
    </main>
  );
}


export default App;
